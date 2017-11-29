/**
 * @module ObjectFilter
 *
 * @description
 * Object filter is a simple list of objects which are and additional constraint for the associated permission.
 * The list of object ids are used to build a waterline criteria object which is then forwarded to the criteria policy
 * where it is merged at runtime with an existing criteria `where` filters.
 *
 */
module.exports = {
  autoCreatedBy: false,
  description: 'Specifies row level filters on a permission',
  attributes: {
    id: {
      type: 'number',
      autoIncrement: true
    },
    objectId: {
      type: 'number'
    },
    permission: {
        model: 'Permission'
    }
  }
};