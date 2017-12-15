# @inspire-platform/sails-hook-permissions

[![NPM version][npm-image]][npm-url]

Comprehensive sails.js user permissions and entitlements system. Supports user authentication with passport.js, role-based permissioning, object ownership, and row-level security.

## Contents

* [Install](#install)
* [Quickstart](#quickstart)
* [Concepts](docs/Concepts.md)
* [Configuration](docs/Configuration.md)
* Managing Permissions
  * [Using REST](docs/Managing-REST.md)
  * [Using Library](docs/Managing-Library.md)

## Install
```sh
$ npm install @inspire-platform/sails-hook-permissions --save
```

## Quickstart

### 1. configure sailsrc

```json
{
  "generators": {
    "modules": {
      "permissions-api": "@inspire-platform/sails-hook-permissions/generator"
    }
  }
}
```

### 2. run generator

> WARNING! The generator is not currently up to date with the 2.x.x releases.

```sh
$ sails generate permissions-api
```

### 3. Manual configuration

#### Env vars

| variable | description | default |
|:---|:---|:---|
| `ADMIN_USERNAME` | admin username | `admin` |
| `ADMIN_EMAIL` | admin user email address | `admin@example.com` |
| `ADMIN_PASSWORD` | admin user password | `admin1234` |


#### config/permissions.js (or config/local.js)
```js
...
permissions: {
  adminUser: {
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin1234'
    // add custom fields here if your model requires them
  }
},
...
```

#### config/policies.js
```js
'*': [
  'basicAuth',
  'passport',
  'sessionAuth',
  'ModelPolicy',
  'AuditPolicy',
  'OwnerPolicy',
  'PermissionPolicy',
  'RolePolicy',
  'CriteriaPolicy'
],

AuthController: {
  '*': [ 'passport' ]
}
```

#### 4. Login
You can now login using the aforementioned default login data or the admin settings you specified using the `/auth/local` endpoint.
```json
{
    "identifier": "admin@example.com",
    "password": "admin1234"
}
```

## License
MIT

[npm-image]: https://img.shields.io/npm/v/@inspire-platform/sails-hook-permissions.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@inspire-platform/sails-hook-permissions
