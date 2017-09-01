'use strict';

var crypto = require('crypto');

var keyGen = function(ivSize, callback) {
  var key, iv, error = null,
    finished = 0,
    expected = 2;

  var finish = function() {
    finished++;
    if (finished === expected) {
      if (error) {
        callback(error);
      } else {
        callback(null, {
          key: key,
          iv: iv
        });
      }
    }
  };

  crypto.randomBytes(32, function(err, k) {
    if (err) {
      error = err;
      return;
    }

    key = k;
    finish();
  });

  crypto.randomBytes(ivSize, function(err, i) {
    if (err) {
      error = err;
      return;
    }

    iv = i;
    finish();
  });
};
exports.keyGen = keyGen;
