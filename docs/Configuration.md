
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