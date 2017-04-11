/**
 * Creates default Roles
 *
 * @public
 */

var _ = require('lodash');

exports.create = function (config) {

  var promises = [];

  _.forEach(config.defaultRoles, function(roleCreate, roleName){
    if (true === roleCreate) {
      promises.push(sails.models.role.findOrCreate({ name: roleName }, { name: roleName }));
    }
  });

  return Promise.all(promises);
};
