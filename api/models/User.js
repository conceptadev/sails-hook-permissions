var _ = require('lodash');
var _super = require('@inspire-platform/sails-hook-auth/dist/api/models/User');

_.merge(exports, _super);
_.merge(exports, {
  attributes: {
    roles: {
      collection: 'Role',
      via: 'users'
    },
    permissions: {
      collection: "Permission",
      via: "user"
    }
  },

  customToJSON: function () {
    return _.pick(this, [
      'id',
      'username',
      'email',
      'lastLogin',
      'roles',
      'permissions',
      'createdAt',
      'updatedAt'
    ]);
  },

  /**
   * Attach default Role to a new User
   */
  afterCreate: function(user, next){
    return setOwner(user, function(err){
      if (err) {
        return next(err);
      } else {
        return attachDefaultRole(user, next);
      }
    });
  }

});


//
// Local helpers
//

function setOwner (user, cb) {
  sails.log.verbose('User.afterCreate.setOwner', user);
  User
    .update({ id: user.id }, { owner: user.id })
    .then(function (user) {
      cb();
    })
    .catch(function (e) {
      sails.log.error(e);
      cb(e);
    });
}

function attachDefaultRole (user, cb) {
  sails.log('User.afterCreate.attachDefaultRole', user);

  if (sails.config.permissions.defaultRole) {

    var defaultRole = sails.config.permissions.defaultRole;

    User.findOne(user.id)
    .populate('roles')
    .then(function (_user) {
      user = _user;
      return Role.findOne({ name: defaultRole });
    })
    .then(function (role) {
      return User
        .addToCollection(user.id, 'roles', [role.id])
        .catch(function (err) {
          return cb(err);
        });
    })
    .then(function (updatedUser) {
      sails.log.silly('role "' + defaultRole + '" attached to user', user.username);
      cb();
    })
    .catch(function (e) {
      sails.log.error(e);
      cb(e);
    })

  } else {
    cb();
  }
}