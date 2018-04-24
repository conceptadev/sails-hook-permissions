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
          modelMap[model.id] = model;
        });

        // loop all permissions
        _.forEach(permissions, function (permission) {

          // grab the action
          var action = permission.action;

          // look up model property in map
          var model = modelMap[permission.model];

          // init properties for this model
          if (false === model.identity in policy) {
            policy[model.identity] = _.pick(model, ['id', 'name', 'identity']);
          }

          // grab policy model (shortcut)
          var policyModel = policy[model.identity];

          // maybe init policy actions for this model
          if (false === 'actions' in policyModel) {
            policyModel.actions = {};
          }

          // set permission to true on model
          policyModel.actions[action] = true;

          // permission has criteria?
          if (permission.criteria.length) {
            // maybe init policy criteria for this model
            if (false === 'criteria' in policyModel) {
              policyModel.criteria = {};
            }
            // maybe init criteria permission action
            if (false === action in policyModel.criteria) {
              policyModel.criteria[action] = [];
            }
            // append each onto criteria for the action
            _.transform(permission.criteria, (acc, o) => {
              acc.push(o.where);
            }, policyModel.criteria[action]);
          }

          // permission has object filters?
          if (permission.objectFilters.length) {
            // maybe init policy object filters for this model
            if (false === 'objectFilters' in policyModel) {
              policyModel.objectFilters = {};
            }
            // maybe init object filter permission action
            if (false === action in policyModel.objectFilters) {
              policyModel.objectFilters[action] = [];
            }
            // append each onto object filters for the action
            _.transform(permission.objectFilters, (acc, o) => {
              // grab filter
              var objectFilter = _.pick(o, 'objectId');
              // does NOT already exist on target?
              if (_.findIndex(acc, objectFilter) < 0) {
                // not exists, push it
                acc.push(objectFilter);
              }
            }, policyModel.objectFilters[action]);
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

      // have permission for model action?
      if (
        true === _.has(policy, [model, 'actions', action]) &&
        true === policy[model].actions[action]
      ) {

        let special = {};
        let modelPolicy = policy[model];

        if (
          true === _.has(modelPolicy, ['criteria', action]) &&
          1 <= modelPolicy.criteria[action].length
        ) {
          special.criteria = modelPolicy.criteria[action];
        }

        if (
          true === _.has(modelPolicy, ['objectFilters', action]) &&
          1 <= modelPolicy.objectFilters[action].length
        ) {
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
            if (
              true === _.has(result, 'criteria') &&
              true === _.isArray(result.criteria) &&
              1 <= result.criteria.length
            ) {
              // yes, more than one?
              if (result.criteria.length > 1) {
                // yes, condition is an or
                conditions.push({
                  or: result.criteria
                })
              } else {
                // just one
                conditions.push(result.criteria[0]);
              }
            }

            // any object filters?
            if (
              true === _.has(result, 'objectFilters') &&
              true === _.isArray(result.objectFilters) &&
              1 <= result.objectFilters.length
            ) {
              // yes, more than one?
              if (result.objectFilters.length > 1) {
                // yes, condition is an or
                conditions.push({
                  or: result.objectFilters.map((o) => {return {id: o.objectId}})
                })
              } else {
                // just one
                conditions.push({id: result.objectFilters[0].objectId});
              }
            }

            break;

          // no perm, resolve false
          default:
            return false;
        }

        // determine final criteria
        if (conditions.length > 1) {
          // multiple conditions, it's an `and`
          criteria.where = {
            and: conditions
          };
        } else if (conditions.length === 1) {
          // only one condition
          criteria.where = conditions[0];
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
  },

  /**
   * Find only whitelisted objects for model policy by applying permission criteria and object filters.
   *
   * If model policy grants full permissions, an empty array is returned.
   *
   * @param {Object} policy Policy object
   * @param {String} model Model id
   * @returns {Promise}
   */
  grantFindWhiteList: function grantFindWhiteList(policy, model) {

    return accessPolicy
      .grantFindCriteria(policy, model)
      .then((grantCriteria) => {

        // any grant criteria?
        if (false === _.isEmpty(grantCriteria)) {
          // yes, white list exists... execute find
          return sails.models[model].find(grantCriteria);
        } else {
          // no, have full permissions... return empty array
          return [];
        }

      });
  }

};

module.exports = accessPolicy;