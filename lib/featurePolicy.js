/*
 * Generate feature policies.
 */

let _ = require('lodash');
let helpers = require('./helpers');

let featurePolicy = {

  /**
   * Format and return user feature policy.
   *
   * @param {Object} user User object
   * @returns {Promise}
   */
  user: function getUserPolicy(user) {

    let features = helpers.findUserFeatures(user);

    return features.then((features) => {
      return _.transform(features, (acc, feature) => {
        acc[feature.identity] = _.pick(feature, ['id', 'name', 'identity']);
      }, {})
    });

  }

};

module.exports = featurePolicy;