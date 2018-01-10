module.exports.permissions = {
  name: 'permissions',

  adminUser: {
    username: process.env.ADMIN_USERNAME || 'admin',
    email: process.env.ADMIN_EMAIL || 'admin@example.com',
    password: process.env.ADMIN_PASSWORD || 'admin1234'
  },

  defaultRoles: {
    admin: true,
    registered: true,
    public: true
  },

  defaultRole: 'registered',

  basePermissions: {
    self: [],
    global: []
  }
};
