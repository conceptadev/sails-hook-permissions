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
   * @returns {Promise}
   */
  user: function getUserPolicy(user) {

    return new Promise((resolve) => {

      return Promise.all([
        helpers.findAllModels(),
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
            policy[modelProperty].criteria[permission.action] =
              _.map(permission.criteria, 'where');
          }
          // permission has object filters?
          if (permission.objectFilters.length) {
            policy[modelProperty].objectFilters[permission.action] =
              _.map(permission.objectFilters, (o) => {
                return _.pick(o, 'allow', 'objectId');
              });
          }
        });

        return resolve(policy);

      });

    });

  }

};


module.exports = accessPolicy;