/**
 * @module Model
 *
 * @description
 *   Abstract representation of a Waterline Model.
 */

let _ = require('lodash');

module.exports = {
  autoCreatedBy: false,
  description: 'Represents a Waterline collection that a User can create, query, etc.',
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
      minLength: 1
    },
    attributes: {
      type: 'json'
    },
    permissions: {
      collection: 'Permission',
      via: 'model'
    },
    createdAt: {
      type: 'number',
      autoCreatedAt: true
    },
    updatedAt: {
      type: 'number',
      autoUpdatedAt: true
    }
  },
  customToJSON: function () {
    return _.pick(this, [
      'id',
      'name',
      'identity',
      'permissions'
    ]);
  }
};
