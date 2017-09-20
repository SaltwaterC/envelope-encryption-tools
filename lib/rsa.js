'use strict';

var fs = require('fs');
var path = require('path');

var forge = require('node-forge');

var padding = {
  PKCS1_V1_5: 1,
  OAEP: 4,
  OAEP_SHA_256_MGF1_SHA_1: 5 // not used in core crypto as RSA constant
};
exports.padding = padding;

var padTransform = function(pad) {
  var options = {},
    forgePad;
  switch (pad) {
    case padding.PKCS1_V1_5:
      forgePad = 'RSAES-PKCS1-V1_5';
      break;
    case padding.OAEP:
      forgePad = 'RSA-OAEP';
      break;
    case padding.OAEP_SHA_256_MGF1_SHA_1:
      forgePad = 'RSA-OAEP';
      options = {
        md: forge.md.sha256.create(),
        mgf1: {
          md: forge.md.sha1.create()
        }
      };
      break;
    default:
      throw new Error('Fatal: unknown padding type.');
  }

  return {
    forgePad: forgePad,
    options: options
  };
};

var encrypt = function(publicKeyPath, pad, message, callback) {
  publicKeyPath = path.resolve(publicKeyPath);

  if (callback === undefined) {
    callback = message;
    message = pad;
    pad = padding.OAEP;
  }

  fs.readFile(publicKeyPath, function(err, data) {
    if (err) {
      return callback(err);
    }

    message = message.toString('binary');
    pad = padTransform(pad);
    var publicKey = forge.pki.publicKeyFromPem(data);
    var encrypt = publicKey.encrypt(message, pad.forgePad, pad.options);
    callback(null, new Buffer(encrypt, 'binary').toString('base64'));
  });
};
exports.encrypt = encrypt;

var decrypt = function(privateKeyPath, pad, message, callback) {
  var passphrase;

  if(typeof privateKeyPath === 'string') {
    privateKeyPath = path.resolve(privateKeyPath);
  } else {
    passphrase = privateKeyPath.passphrase;
    privateKeyPath = path.resolve(privateKeyPath.path);
  }

  if (callback === undefined) {
    callback = message;
    message = pad;
    pad = padding.OAEP;
  }

  fs.readFile(privateKeyPath, function(err, data) {
    if (err) {
      return callback(err);
    }

    var privateKey;

    message = new Buffer(message, 'base64').toString('binary');
    pad = padTransform(pad);

    if(passphrase) {
      privateKey = forge.pki.decryptRsaPrivateKey(data, passphrase);
    } else {
      privateKey = forge.pki.privateKeyFromPem(data);
    }

    var decrypt = privateKey.decrypt(message, pad.forgePad, pad.options);
    callback(null, new Buffer(decrypt, 'binary'));
  });
};
exports.decrypt = decrypt;
