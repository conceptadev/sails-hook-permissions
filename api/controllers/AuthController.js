
var _ = require('lodash');
var _super = require('@inspire-platform/sails-hook-auth/api/controllers/AuthController');
var accessPolicy = require('../../lib/accessPolicy');

_.merge(exports, _super);
_.merge(exports, {

  accessPolicy: function policy(req, res) {

    // does user have session?
    if (true === req.session.authenticated) {
      // try to get user access policy
      return accessPolicy.user(req.user)
        .then((policy) => {
          // got one, return it
          return res.send(policy);
        }).catch((err) => {
          // not good, log error
          sails.log.debug(err);
          // don't provide an error info (paranoid)
          return res.forbidden();
        });
    }

    // default to forbidden
    return res.forbidden();
  }

});
