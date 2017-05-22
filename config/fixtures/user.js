/**
 * Create admin user.
 * @param adminRole - the admin role which grants all permissions
 */
import _ from 'lodash'
exports.create = function (roles, userModel) {
  if (_.isEmpty(sails.config.permissions.adminUser.username)) {
    throw new Error('sails.config.permissions.adminUser.username is not set');
  }
  if (_.isEmpty(sails.config.permissions.adminUser.password)) {
    throw new Error('sails.config.permissions.adminUser.password is not set');
  }
  if (_.isEmpty(sails.config.permissions.adminUser.email)) {
    throw new Error('sails.config.permissions.adminUser.email is not set');
  }
  return sails.models.user.findOne({ username: sails.config.permissions.adminUser.username })
    .then(function (user) {
      if (user) return user;

      sails.log.info('sails-hook-permissions: admin user does not exist; creating...');

      let adminUser = _.merge(
        sails.config.permissions.adminUser,
        {
          roles: [ _.find(roles, { name: 'admin' }).id ],
          createdBy: 1,
          owner: 1,
          model: userModel.id
        }
      );

      return sails.models.user.register(adminUser);
  });
};
