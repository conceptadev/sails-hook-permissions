/**
 * @module Feature
 *
 * @description
 *   Simple tag style permissions.
 *   These are useful for situations when there is a need to create ad hoc policies unrelated to models.
 */
module.exports = {
  autoCreatedBy: false,
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
    identity: {
      type: 'string',
      required: true,
      unique: true,
      minLength: 1
    },
    active: {
      type: 'boolean',
      defaultsTo: true
    },
    roles: {
      collection: 'Role',
      via: 'features'
    },
    users: {
      collection: 'User',
      via: 'features'
    }
  }
};
