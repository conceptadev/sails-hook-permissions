module.exports = require('sails-generate-entities')({
  module: '@inspire-platform/sails-hook-permissions',
  id: 'permissions-api',
  statics: [
    'config/permissions.js'
  ],
});
