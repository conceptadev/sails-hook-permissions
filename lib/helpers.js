
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

      // specific model and/or action?
      ['model', 'action'].forEach((property) => {
        if (
          true === property in options &&
          _.isString(options[property]) &&
          1 <= options[property].length
        ) {
          // yep, set it
          permCriteria[property] = options[property];
        }
      });

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

  }

};

module.exports = helpers;