/**
 * RolePolicy
 * @depends PermissionPolicy
 * @depends OwnerPolicy
 * @depends ModelPolicy
 *
 * Verify that User is satisfactorily related to the Object's owner.
 * By this point, we know we have some permissions related to the action and object
 * If they are 'owner' permissions, verify that the objects that are being accessed are owned by the current user
 */
import _ from 'lodash'

module.exports = function(req, res, next) {

  // can't apply policy to unknown model
  if (req.options.unknownModel) {
    return next();
  }

  var action = PermissionService.getMethod(req.method);
  var relations = _.groupBy(req.permissions, 'relation');

  // do any role or user permissions exist which grant the asserted privilege?
  if (
    false === _.isEmpty(relations.role) ||
    false === _.isEmpty(relations.user)
  ) {
    // yes, continue
    return next();
  }

  //
  // If we made it this far, we are dealing with object owner permissions
  //

  if (true === _.has(req.options, 'modelDefinition.attributes.owner')) {

    // are we creating?
    if ('create' === action) {
      // owner permission never allows create
      return res.send(403, {
        error: 'Cannot perform action [create] without role or user based permission'
      });
    }

    // are we mutating?
    if (true === _.contains(['update', 'delete'], action)) {
      // yes, find objects that would be modified/deleted.
      return PermissionService.findTargetObjects(req)
        .then(function (objects) {
          if (PermissionService.hasForeignObjects(objects, req.user)) {
            return res.send(403, {
              error: 'Cannot perform action [' + action + ']. Authenticated user does not own one or more target objects.'
            });
          } else {
            return next();
          }
        }).catch(next);
    }

    // This block allows us to filter reads by the owner attribute, rather than failing an entire request
    // if some of the results are not owned by the user.
    req.params.all().where = req.params.all().where || {};
    req.params.all().where.owner = req.user.id;
    req.query.owner = req.user.id;
    _.isObject(req.body) && (req.body.owner = req.user.id);

    // not mutating
    return next();

  } else {

    // no owner attribute on model!
    return res.send(403, {
      error: `Cannot apply owner permission policy to model ${req.method} due to missing "owner" attribute.`
    });

  }

};
