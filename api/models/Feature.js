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
    description: {
      type: 'string',
      minLength: 1,
      allowNull: true
    },
    identity: {
      type: 'string',
      required: true,
      unique: true,
      minLength: 1
    },
    context: {
      type: 'string',
      required: false,
      minLength: 1,
      defaultsTo: 'default'
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
