/*
 * Generate access policies.
 */

let _ = require('lodash');
let helpers = require('./helpers');

let accessPolicy = {

  /**
   * Format and return user access policy.
   *
   * @param {Object} user User object
   * @param {Object} options Options object
   * @param {Object} options.modelCriteria Criteria to pass to findModels.
   * @returns {Promise}
   */
  user: function getUserPolicy(user, options = {}) {

    return new Promise((resolve) => {

      let defOptions = {
        modelCriteria: {}
      };

      _.defaults(options, defOptions);

      return Promise.all([
        helpers.findModels(options.modelCriteria),
        helpers.findUserPermissions(user, {populate: ['criteria', 'objectFilters']})
      ]).then((result) => {

        let [models, permissions] = result;

        // map all model ids
        let modelMap = {};

        // policy to return
        let policy = {};

        // loop all models
        _.forEach(models, function (model) {
          // map model id
          modelMap[model.id] = model.identity;
          // arrange by model identity
          policy[model.identity] = _.pick(model, ['id', 'name', 'identity']);
          // init actions
          policy[model.identity].actions = {
            create: false,
            read: false,
            update: false,
            delete: false
          };
          // init criteria
          policy[model.identity].criteria = {
            create: [],
            read: [],
            update: [],
            delete: []
          };
          // init object filters
          policy[model.identity].objectFilters = {
            create: [],
            read: [],
            update: [],
            delete: []
          };
        });

        // loop all permissions
        _.forEach(permissions, function (permission) {

          // look up model property in map
          var modelProperty = modelMap[permission.model];

          // set permission to true on model
          policy[modelProperty].actions[permission.action] = true;

          // permission has criteria?
          if (permission.criteria.length) {
            // yes, append each onto criteria for the action
            _.map(permission.criteria, 'where').forEach((o) => {
              policy[modelProperty].criteria[permission.action].push(o);
            });
          }

          // permission has object filters?
          if (permission.objectFilters.length) {
            // yes, append each onto object filters for the action
            _.map(permission.objectFilters, function (o) {
              return _.pick(o, 'objectId');
            }).forEach((o) => {
              // does NOT already exist on target?
              if (_.findIndex(policy[modelProperty].objectFilters[permission.action], {'objectId': o.objectId}) < 0) {
                // not exists, push it
                policy[modelProperty].objectFilters[permission.action].push(o);
              }
            });
          }

        });

        return resolve(policy);

      });

    });

  },

  /**
   * Check policy for grant of specific model action.
   *
   * If criteria and/or object filters are set, these are resolved in an object
   * so the implementing code can further decide how to handle special conditions.
   *
   * @param {Object} policy Policy object
   * @param {String} model Model id
   * @param {String} action Action name
   * @returns {Promise}
   */
  grantCheck: function grantCheck(policy, model, action) {

    return new Promise(function (resolve, reject) {

      // model policy exists in policy?
      if (false === model in policy) {
        return reject(new Error(`Model "${model}" does not exist in policy.`))
      }

      // action exists in model policy?
      if (false === action in policy[model].actions) {
        return reject(new Error(`The "${accessPolicy}" does not exist in the "${model}" model policy.`))
      }

      // have permission for model action?
      if (true === policy[model].actions[action]) {

        let special = {};
        let modelPolicy = policy[model];

        if (modelPolicy.criteria[action].length) {
          special.criteria = modelPolicy.criteria[action];
        }

        if (modelPolicy.objectFilters[action].length) {
          special.objectFilters = modelPolicy.objectFilters[action];
        }

        // any special conditions?
        if (false === _.isEmpty(special)) {
          return resolve(special);
        } else {
          // has full permissions to this action
          return resolve(true);
        }

      }

      // no permissions at all
      return resolve(false);

    });

  },

  /**
   * Build grant find criteria for model policy.
   *
   * @param {Object} policy Policy object
   * @param {String} model Model id
   * @returns {Promise}
   */
  grantFindCriteria: function grantFindCriteria(policy, model) {

    return accessPolicy
      .grantCheck(policy, model, 'read')
      .then((result) => {

        let criteria = {};
        let conditions = [];

        // start building criteria
        switch (true) {

          // full perm
          case result:
            break;

          // partial perm
          case _.isPlainObject(result):
            // any criteria?
            if ('criteria' in result) {
              // yes, push each criteria onto conditions
              result.criteria.forEach((o) => {
                conditions.push(o);
              });
            }
            // any object filters?
            if ('objectFilters' in result) {
              // yes, init object filter sub-conditions
              let ofSubConditions = [];
              // push each filter onto sub-conditions
              result.objectFilters.forEach((o) => {
                // id must equal filter objectId
                ofSubConditions.push({id: o.objectId});
              });
              // push all sub-conditions onto conditions
              if (ofSubConditions.length > 1) {
                // use an or
                conditions.push({or: ofSubConditions});
              } else if (ofSubConditions.length === 1) {
                // first item only (equals)
                conditions.push(ofSubConditions[0]);
              }
            }
            break;

          // no perm, resolve false
          default:
            return false;
        }

        // add conditions if any exist
        if (conditions.length >= 1) {
          criteria.where = {
            and: conditions
          }
        }

        // resolve criteria
        return criteria;

      });

  },

  /**
   * Execute find on model using policy as filter.
   *
   * @param {Object} policy Policy object
   * @param {String} model Model id
   * @param {Object} options Options
   * @param {Object} options.customCriteria Valid Waterline query criteria
   * @returns {Promise}
   */
  grantFind: function grantFind(policy, model, options = {}) {

    _.defaults(options, {
      customCriteria: {}
    });

    return accessPolicy
      .grantFindCriteria(policy, model)
      .then((grantCriteria) => {

        // final criteria
        let criteria = {};

        // have custom criteria?
        if (false === _.isEmpty(options.customCriteria) ) {

          // any grant criteria?
          if (true === _.isEmpty(grantCriteria)) {

            // no, use custom criteria as is
            criteria = options.customCriteria;

          } else {

            // conditions
            let conditions = [];

            // use everything except `where`
            criteria = _.omit(options.customCriteria, 'where');

            // if where exists, push onto the conditions
            if ('where' in options.customCriteria) {
              conditions.push(options.customCriteria.where);
            }

            // add grant criteria
            conditions.push(grantCriteria.where);

            // add conditions
            criteria.where = {
              and: conditions
            }
          }

        } else {
          // use grant criteria as is
          criteria = grantCriteria;
        }

        // execute find
        return sails.models[model].find(criteria);
      });

  }

};

module.exports = accessPolicy;