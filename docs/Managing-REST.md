# Managing Using REST

All permissions management can be easily achieved using Sails.js v1 REST
[blueprint routes](https://next.sailsjs.com/documentation/concepts/blueprints/blueprint-routes).

> _You can also use the [permissions library](Managing-Library.md) to accomplish the same thing._

### Model

| Path | Methods |
|------|---------|
|`/model`| GET |
|`/model/{id}` | GET |
|`/model/{id}/permissions`| GET |

### User

| Path | Methods |
|------|---------|
|`/user`| GET, POST |
|`/user/{id}`| GET, PATCH, DELETE |
|`/user/{id}/permissions`| GET |
|`/user/{id}/roles` | GET |
|`/user/{id}/roles/{roleId}` | PUT, DELETE |

### Role

| Path | Methods |
|------|---------|
|`/role`| GET, POST |
|`/role/{id}`| GET, PATCH, DELETE |
|`/role/{id}/permissions`| GET |
|`/role/{id}/users` | GET |
|`/role/{id}/users/{userId}` | PUT, DELETE |

### Permission

| Path | Methods |
|------|---------|
|`/permission`| GET, POST |
|`/permission/{id}`| GET, PATCH, DELETE |
|`/permission/{id}/criteria` | GET |
|`/permission/{id}/criteria/{criteriaId}` | PUT, DELETE |
|`/permission/{id}/objectFilters` | GET |
|`/permission/{id}/objectFilters/{objectFilterId}` | PUT, DELETE |

### Criteria

| Path | Methods |
|------|---------|
|`/criteria`| GET, POST |
|`/criteria/{id}`| GET, PATCH, DELETE |

### Object Filter

| Path | Methods |
|------|---------|
|`/objectFilter`| GET, POST |
|`/objectFilter/{id}`| GET, PATCH, DELETE |