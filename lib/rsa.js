'use strict';

var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

var encrypt = function(publicKeyPath, padding, message, callback) {
  var options = {};
  publicKeyPath = path.resolve(publicKeyPath);

  if (callback === undefined) {
    callback = message;
    message = padding;
  } else {
    options.padding = padding;
  }

  fs.readFile(publicKeyPath, function(err, data) {
    if (err) {
      return callback(err);
    }
    options.key = data;
    callback(null, crypto.publicEncrypt(options, message).toString('base64'));
  });
};
exports.encrypt = encrypt;

var decrypt = function(privateKeyPath, padding, message, callback) {
  var options = {};
  privateKeyPath = path.resolve(privateKeyPath);

  if (callback === undefined) {
    callback = message;
    message = padding;
  } else {
    options.padding = padding;
  }

  fs.readFile(privateKeyPath, function(err, data) {
    if (err) {
      return callback(err);
    }
    options.key = data;
    message = new Buffer(message, 'base64');
    callback(null, crypto.privateDecrypt(options, message));
  });
};
exports.decrypt = decrypt;
