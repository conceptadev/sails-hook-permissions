# @inspire-platform/sails-hook-permissions

[![NPM version][npm-image]][npm-url]

Comprehensive sails.js user permissions and entitlements system. Supports user authentication with passport.js, role-based permissioning, object ownership, and row-level security.

## Install
```sh
$ npm install @inspire-platform/sails-hook-permissions --save
```

## Quickstart

**Note:** Complete documentation available in the sails-permissions wiki: https://github.com/langateam/sails-permissions/wiki

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

### 3. Set environment variables

| variable | description | default |
|:---|:---|:---|
| `ADMIN_USERNAME` | admin username | `admin` |
| `ADMIN_EMAIL` | admin user email address | `admin@example.com` |
| `ADMIN_PASSWORD` | admin user password | `admin1234` |

##### e.g in config/local.js (file is in .gitignore)
```
sails.config.permissions.adminUsername = 'admin'
sails.config.permissions.adminEmail = 'admin@example.com'
sails.config.permissions.adminPassword = 'admin1234'
```
#### 4. update configs

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

#### 5. Login
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
