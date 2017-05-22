var permissionPolicies = [
  'passport',
  'sessionAuth',
  'ModelPolicy',
  'OwnerPolicy',
  'PermissionPolicy',
  'RolePolicy'
]
import path from 'path'
import _ from 'lodash'

class Permissions {

  constructor (sails) {
    this.sails = sails;
  }

  configure () {
    if (!_.isObject(sails.config.permissions)) sails.config.permissions = { }
  }

  initialize (next) {
    let config = this.sails.config.permissions

    this.sails.after('hook:auth:loaded', () => {
      if (!this.validateDependencies()) {
        this.sails.log.error('Cannot find @inspire-platform/sails-hook-auth hook. Did you "npm install @inspire-platform/sails-hook-auth --save"?')
        this.sails.log.error('Please see README for installation instructions: https://github.com/conceptainc/sails-hook-permissions')
        return this.sails.lower()
      }

      if (!this.validatePolicyConfig()) {
        this.sails.log.warn('One or more required policies are missing.')
        this.sails.log.warn('Please see README for installation instructions: https://github.com/conceptainc/sails-hook-permissions')
      }

    })

    this.sails.after('hook:orm:loaded', () => {
      sails.models.model.count()
        .then(count => {
          if (count === _.keys(this.sails.models).length) return next()

          return this.initializeFixtures()
            .then(() => {
              next()
            })
        })
        .catch(error => {
          this.sails.log.error(error)
          next(error)
        })
    })
  }

  validatePolicyConfig () {
    var policies = this.sails.config.policies
    return _.all([
      _.isArray(policies['*']),
      _.intersection(permissionPolicies, policies['*']).length === permissionPolicies.length,
      policies.AuthController && _.contains(policies.AuthController['*'], 'passport')
    ])
  }

  /**
  * Install the application. Sets up default Roles, Users, Models, and
  * Permissions, and creates an admin user.
  */
  initializeFixtures () {
    let fixturesPath = path.resolve(__dirname, '../../../config/fixtures/')
    return require(path.resolve(fixturesPath, 'model')).createModels()
      .then(models => {
        this.models = models
        this.sails.hooks.permissions._modelCache = _.indexBy(models, 'identity')

        return require(path.resolve(fixturesPath, 'role')).create(this.sails.config.permissions)
      })
      .then(roles => {
        this.roles = roles
        var userModel = _.find(this.models, { name: 'User' })
        return require(path.resolve(fixturesPath, 'user')).create(this.roles, userModel)
      })
      .then(() => {
        return sails.models.user.findOne({ email: this.sails.config.permissions.adminUser.email })
      })
      .then(user => {
        this.sails.log('sails-hook-permissions: created admin user:', user)
        return User.update(
          {
            id: user.id
          }, {
            createdBy: user.id,
            owner: user.id
          }).meta({
          fetch: true
        });
      })
      .then(admin => {
        return require(path.resolve(fixturesPath, 'permission')).create(this.roles, this.models, admin, this.sails.config.permissions);
      })
      .catch(error => {
        this.sails.log.error(error)
      })
  }

  validateDependencies () {
    return !!this.sails.hooks.auth;
  }
}


/**
 * This is the hook.
 *
 * @param sails
 * @returns {{configure: configure, initialize: initialize}}
 */
module.exports = function (sails) {

  let permissions = new Permissions(sails);

  return {

    configure: function() {
      return permissions.configure();
    },

    initialize: function(next) {
      sails.after('hook:auth:loaded', () => permissions.initialize(next))
    }

  };
};
