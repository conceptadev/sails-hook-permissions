/**
 * @module Role
 *
 * @description
 *   Roles endow Users with Permissions. Exposes Postgres-like API for
 *   resolving granted Permissions for a User.
 *
 * @see <http://www.postgresql.org/docs/9.3/static/sql-grant.html>
 */
module.exports = {
  autoCreatedBy: false,
  description: 'Confers `Permission` to `User`',
  attributes: {
    id: {
      type: 'number',
      autoIncrement: true
    },
    name: {
      type: 'string',
      required: true,
      unique: true,
      minLength: 1
    },
    description: {
      type: 'string',
      minLength: 1,
      allowNull: true
    },
    active: {
      type: 'boolean',
      defaultsTo: true
    },
    users: {
      collection: 'User',
      via: 'roles'
    },
    permissions: {
      collection: 'Permission',
      via: 'role'
    },
    features: {
      collection: 'Feature',
      via: 'roles'
    }
  }
};
