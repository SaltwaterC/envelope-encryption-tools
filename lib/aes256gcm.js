'use strict';

var util = require('util');
var crypto = require('crypto');
var stream = require('stream');
var Transform = stream.Transform;

var core = require('./aes256core');

function Encrypt(options) {
  var self = this;

  if (!(this instanceof Encrypt)) {
    return new Encrypt(options);
  }

  this.options = options;
  this._cipher = crypto.createCipheriv('aes-256-gcm', options.key, options.iv);
  this.mac = null;
  Transform.call(this, options);

  this.length = 0;
  this.on('data', function(chunk) {
    self.length += chunk.length;
  });
}
util.inherits(Encrypt, Transform);

Encrypt.prototype._transform = function(chunk, encoding, callback) {
  this.push(this._cipher.update(chunk));
  callback();
};

Encrypt.prototype._flush = function(callback) {
  this._cipher.final();
  // Encrypt-then-MAC
  this.mac = this._cipher.getAuthTag();
  if (this.options.appendMac === true) {
    this.push(this.mac);
  }
  callback();
};
exports.encrypt = Encrypt;

function Decrypt(options) {
  if (!(this instanceof Decrypt)) {
    return new Decrypt(options);
  }
  this._decipher = crypto.createDecipheriv('aes-256-gcm', options.key, options.iv);
  this._decipher.setAuthTag(options.mac);
  Transform.call(this, options);
}
util.inherits(Decrypt, Transform);

Decrypt.prototype._transform = function(chunk, encoding, callback) {
  this.push(this._decipher.update(chunk));
  callback();
};

Decrypt.prototype._flush = function(callback) {
  this._decipher.final();
  callback();
};
exports.decrypt = Decrypt;

var keyGen = function(callback) {
  core.keyGen(12, callback);
};
exports.keyGen = keyGen;
