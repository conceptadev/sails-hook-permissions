# Managing Using Library

The permissions service app makes it easy to manage permissions from custom controllers, services,
or pretty much any other code which is executed after the permissions hook has been full loaded.

> _You can also use the Sails.js REST [blueprint routes](Managing-REST.md) to accomplish the same thing._

## Creating Roles

There are two ways to create a new `Role`:

Let's say you want to create a new role called `collaborator`, and assign it to User `mrpibb`:

1. The same way you would create any other sails.js object:

    ```js
    User.findOne({ username: 'mrpibb' })
      .then(function (user) {
        return Role.create({
          name: 'collaborator',
          users: [ user.id ]
        })
      .then(function (role) {
        console.log(role);
      })
      .catch(function (error) {
        console.error(error);
      });
    ```

2. Via the PermissionService helper method ’createRole’.
    Note that this method requires creating one or more `Permission` objects as part of the method call (see the 'permissions' key in the object passed into the createRole function below).
    ```js
    PermissionService.createRole({ name: 'collaborator', users: 'mrpibb', 
                                   permissions: [{ model: 'mymodel', action: 'create' }, 
                                                 { model: 'myothermodel', action: 'read' }] })
    ````

## Creating Permissions

Creating a Role is super easy. By default, new Roles have no Permissions. There are two ways to grant new `Permissions` to a `Role`:

Let's say you want to grant Users with the role collaborator with the ability to create and read all Project and Issue objects.

1. Create Permission objects just like any other sails.js model, and associate it with a Role.

    ```js
    Promise.bind({ }, Role.findOne({ name: 'collaborator' })
      .then(function (role) {
        this.role = role;
        return Model.find({ name: [ 'Project', 'Issue' ] });
      })
      .map(function (model) {
        return [
          Permission.create({
            model: model.id,
            action: 'create',
            role: this.role.id
          }),
          Permission.create({
            model: model.id,
            action: 'read',
            role: this.role.id
          })
        ];
      })
      .spread(function (createPermission, readPermission) {
        sails.log('new create permission', createPermission);
        sails.log('new read permission', readPermission);
      })
      .catch(sails.log.error);
    ```

2. Use the PermissionService helper method ‘grant’.
    ```js
    Promise.all([PermissionService.grant({ role: 'collaborator', model: 'Project', action: 'read'}),
                 PermissionService.grant({ role: 'collaborator', model: 'Project', action: 'create'}),
                 PermissionService.grant({ role: 'collaborator', model: 'Issue', action: 'read'}),
                 PermissionService.grant({ role: 'collaborator', model: 'Issue', action: 'create'}])
            .spread(function (projectRead, projectCreate, issueRead, issueCreate) {
                sails.log('new read Project permission', projectRead);
                sails.log('new create Project permission', projectCreate);
                sails.log('new read Issue permission', issueRead);
                sails.log('new create Issue permission', issueCreate);
            });
    ```

## Revoking Permissions

Permissions are revoked simply by deleting the relevant Permission object, or by using the PermissionService helper method ‘revoke’.

Let's say we want to revoke the `create` Permission we just granted to the `collaborator` Role for `Project`.

```js
Promise.bind({ }, Role.findOne({ name: 'collaborator' })
  .then(function (role) {
    this.role = role;
    return Model.findOne({ name: 'Project' });
  })
  .then(function (model) {
    return Permission.destroy({
      model: model.id,
      action: 'read',
      role: role.id,
    });
  })
  .then(function () {
    sails.log('revoked "read" from "collaborator" on "Project"');
  })
  .catch(sails.log.error);
```

There is also a helper method in PermissionService named ‘revoke’:
```js
PermissionService.revoke({ model: 'project', action: 'read', role: 'collaborator', relation: 'role' })
    .then(function () {
        sails.log('revoked “read” from “collaborator” on “Project”');
    });
```

## Role add/remove Users:

PermissionService has helpers to facilitate adding users to and removing users from a role.  You can pass a single username or an array of usernames to these functions.
```js
PermissionService.addUsersToRole('someusername', 'collaborator')
    .then(function () {
       sails.log('added “someusername” to role “collaborator”');
    });

PermissionService.removeUsersFromRole(['someusername', 'mrpibb'], 'collaborator')
    .then(function () {
        sails.log('removed “someusername” and “mrpibb” from role “collaborator”');
    });
```