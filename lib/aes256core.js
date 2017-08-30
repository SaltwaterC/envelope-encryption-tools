'use strict';

var crypto = require('crypto');

var keyGen = function(ivSize, callback) {
  var key;

  crypto.randomBytes(32, function(err, k) {
    if (err) {
      return callback(err);
    }

    key = k;

    crypto.randomBytes(ivSize, function(err, i) {
      if (err) {
        return callback(err);
      }

      callback(null, {
        key: key,
        iv: i
      });
    });
  });
};
exports.keyGen = keyGen;
