
let _ = require('lodash');

let helpers = {

  /**
   * Return all tracked models.
   *
   * @param {Object} criteria
   * @param {Array} criteria.select Fields to select, defaults to: id, name, identity.
   * @return {Promise}
   */
  findModels: function findModels(criteria = {}) {

    if (false === 'select' in criteria) {
      criteria.select = ['id','name','identity'];
    }

    // find models using criteria
    return Model.find(criteria);
  },

  /**
   * Lookup all permissions granted to one user (user, and role relations).
   *
   * @param {Object} user User object
   * @param {Object} options
   * @param {String} options.model
   * @param {String} options.action
   * @param {Array} options.populate
   * @returns {Promise}
   */
  findUserPermissions: function findUserPermissions(user = {}, options = {}) {

    // find user
    let findOneUser = User.findOne(user.id);

    // populate roles and permissions
    findOneUser.populate('roles', {active: true});

    // exec
    return findOneUser.then((user) => {

      // find all permissions assigned directly to user, or via role
      let permCriteria = {
        or: [
          {
            user: user.id
          }
        ]
      };

      // push every role onto `or`
      _.forEach(user.roles, function(role){
        permCriteria.or.push({role: role.id});
      });

      // specific model and/or action id?
      ['model', 'action'].forEach((property) => {
        if (
          true === property in options &&
          (
            true === _.isFinite(options[property]) ||
            (
              true === _.isString(options[property]) &&
              1 <= options[property].length
            )
          )
        ) {
          // yep, set it
          permCriteria[property] = options[property];
        }
      });

      // specific model (object)?
      if (true === _.has(options, ['model', 'id'])) {
        permCriteria.model = options.model.id;
      }

      // init perm find promise
      let findPerm = Permission.find(permCriteria);

      // populate any permissions associations?
      if (
        true === 'populate' in options &&
        true === Array.isArray(options.populate) &&
        1 <= options.populate.length
      ) {
        // yes, loop them
        options.populate.forEach((assoc) => {
          // is object?
          if (true === _.isPlainObject(assoc)) {
            // yes, has criteria?
            if ('criteria' in assoc) {
              // yes, use it!
              findPerm.populate(assoc.model, assoc.criteria);
            } else {
              // no criteria, just model
              findPerm.populate(assoc.model);
            }
          } else {
            // nothing fancy
            findPerm.populate(assoc);
          }
        });
      }

      // finally return promise
      return findPerm;
    });

  },

  /**
   * Lookup all features granted to one user (user, and role relations).
   *
   * @param {Object} user User object
   * @param {Object} options
   * @returns {Promise}
   */
  findUserFeatures: function findUserFeatures(user = {}, options = {}) {

    // find user
    let findOneUser = User.findOne(user.id);

    // populate user roles and features
    findOneUser
      .populate('roles', {active: true})
      .populate('features', {active: true});

    // exec
    return findOneUser.then((user) => {

      // user belongs to any roles?
      if (user.roles.length >= 1) {

        // find all features assigned to user via role.
        // this requires a second role query with features populated.
        let extRoleCriteria = {
          or: []
        };

        // push every role onto `or`
        _.forEach(user.roles, function (role) {
          extRoleCriteria.or.push({id: role.id});
        });

        // init roles + features find promise
        let findExtRoles = Role.find(extRoleCriteria).populate('features', {active: true});

        // try to find role features
        return findExtRoles.then((roles) => {
          // need one flat array (including directly assigned)
          let features = Array.prototype.concat(
            user.features,
            _.flatten(_.map(roles, (role) => role.features))
          );
          // unique by id
          return _.uniq(features, 'id');
        });

      } else {
        // no roles, return only directly assigned user features
        return user.features;
      }

    });

  }

};

module.exports = helpers;