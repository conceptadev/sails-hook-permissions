# Configuration

## Properties

### `sails.models`

These can be set per-Model in the individual Model files (in api/models)

| name | description |
|:-----|:------------|
| `autoCreatedBy` | automatically set `createdBy` and `owner` attributes on newly created objects |

### `sails.config.permissions`

| name | description | default |
|:-----|:------------|:--------|
| `adminUser` | default admin user settings | [see config](../config/permissions.js) |
| `defaultRoles` | default roles to create | [see config](../config/permissions.js) |
| `defaultRole` | default role to assign to new users | `registered` |
| `basePermissions` | base permissions to assign globally or per authenticated user | [details](#base-permissions) |

## Appendix

#### Base Permissions

Base permissions allows for the configuration of grants that can be automatically injected at run time.

There are two contexts under which permissions are injected, `self` and `global`. Self permissions specifically
scope to the authenticated user. Global permissions behave like regular permissions.

__Context properties:__

| context | description | default |
|:-----|:------------|:--------:|
| `basePermissions.self` | Array of permission grant objects | `[]` |
| `basePermissions.global` | Array of permission grant objects | `[]` |

> The key difference between `self` and `global` is that permission grants defined under `self`
> will have the user id of the currently authenticated user automagically _appended_ to each of the
> configured permission's object filters array.
>
> Unless you have defined another model that re-uses the `User` id as a primary key,
> the `self` scope is, in effect, only useful for the `User` model.

__The permission grant object schema:__

| property | description | required |
|:-----|:------------|:--------:|
| `model` | A valid model identity | Yes |
| `action` | A valid permission action | Yes |
| `criteria` | An array of criteria objects | No |
| `objectFilters` | an array of object filter objects | No |

Example permission grant object:

```javascript
{
    model: 'store',
    action: 'read',
    criteria: [
      {
        where: {
          active: true
        }
      }
    ],
    objectFilters: [
      {
        objectId: 765
      }
    ]
}
```

Verbose example of base permissions:

```javascript

  basePermissions: {
    self: [
      // can read self
      {
        model: 'user',
        action: 'read'
      },
      // can update self if a custom locked flag is toggled off
      {
        model: 'user',
        action: 'update',
        criteria: [
          {
            where: {
              locked: false
            }
          }
        ]
      }
    ],
    global: [
        // can read any store in US
        {
            model: 'store',
            action: 'read',
            criteria: [
              {
                where: {
                  country: 'US'
                }
              }
            ]
        },
        // can update any active store in whitelist
        {
            model: 'store',
            action: 'update',
            criteria: [
              {
                where: {
                  active: true
                }
              }
            ],
            objectFilters: [
              {
                objectId: 765
              },
              {
                objectId: 876
              },
              {
                objectId: 987
              }
            ]
        }
    ]
  }

```