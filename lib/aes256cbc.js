'use strict';

var crypto = require('crypto');

var core = require('./aes256core');

var encrypt = function(options) {
  return crypto.createCipheriv('aes-256-cbc', options.key, options.iv);
};
exports.encrypt = encrypt;

var decrypt = function(options) {
  return crypto.createDecipheriv('aes-256-cbc', options.key, options.iv);
};
exports.decrypt = decrypt;

var keyGen = function(callback) {
  core.keyGen(16, callback);
};
exports.keyGen = keyGen;
