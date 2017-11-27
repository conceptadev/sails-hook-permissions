
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
   * @param {Array} options.populate
   * @returns {Promise}
   */
  findUserPermissions: function findUserPermissions(user = {}, options = {}) {

    // find user
    let find = User.findOne(user.id);

    // populate roles and permissions
    find.populate('roles', {active: true});

    // exec
    return find.then((user) => {

      // find all permissions assigned directly to user, or via role
      let userCriteria = {
        or: [
          {
            user: user.id
          },
          {
            role: _.map(user.roles, 'id')
          }
        ]
      };

      // init perm find promise
      let findPerm = Permission.find(userCriteria);

      // populate any permissions associations?
      if ('populate' in options && Array.isArray(options.populate)) {
        // yes, loop them
        options.populate.forEach((assoc) => {
          // call populate
          findPerm.populate(assoc);
        });
      }

      // finally return promise
      return findPerm;
    });

  }

};

module.exports = helpers;