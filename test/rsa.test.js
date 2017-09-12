'use strict';

/*global describe: true, before: true, it: true*/

var fs = require('fs');
var crypto = require('crypto');

var rsa = require('..').rsa;

var assert = require('chai').assert;

describe('RSA tests', function() {
  var payload1, payload2, payload3, message1, message2, message3;

  before(function(done) {
    var expect = 3;
    var actual = 0;

    var finish = function() {
      actual++;
      if (actual === expect) {
        done();
      }
    };

    crypto.randomBytes(32, function(err, bytes) {
      assert.ifError(err);
      payload1 = bytes;
      finish();
    });

    crypto.randomBytes(32, function(err, bytes) {
      assert.ifError(err);
      payload2 = bytes;
      finish();
    });

    crypto.randomBytes(32, function(err, bytes) {
      assert.ifError(err);
      payload3 = bytes;
      finish();
    });
  });

  describe('encrypt', function() {
    it('should encrypt test string with default OAEP padding', function(done) {
      rsa.encrypt('test/data/public.pem', payload1, function(err, encrypted) {
        assert.ifError(err, 'we have an error');

        assert.isString(encrypted, 'a string is passed to the completion callback');
        message1 = encrypted;

        done();
      });
    });

    it('should encrypt test string with PKCS1_V1_5 padding', function(done) {
      rsa.encrypt('test/data/public.pem', rsa.padding.PKCS1_V1_5, payload2, function(err, encrypted) {
        assert.ifError(err, 'we have an error');

        assert.isString(encrypted, 'a string is passed to the completion callback');
        message2 = encrypted;

        done();
      });
    });

    it('should encrypt test string with OAEP_SHA_256_MGF1_SHA_1 padding', function(done) {
      rsa.encrypt('test/data/public.pem', rsa.padding.OAEP_SHA_256_MGF1_SHA_1, payload3, function(err, encrypted) {
        assert.ifError(err, 'we have an error');

        assert.isString(encrypted, 'a string is passed to the completion callback');
        message3 = encrypted;

        done();
      });
    });
  });

  describe('decrypt', function() {
    it('should decrypt test string with default OAEP padding', function(done) {
      rsa.decrypt('test/data/private.pem', message1, function(err, decrypted) {
        assert.ifError(err, 'we have an error');

        assert.strictEqual(decrypted.toString('binary'), payload1.toString('binary'), 'the test string is sucessfully decrypted');

        done();
      });
    });

    it('should decrypt test string with default OAEP padding using crypto module', function(done) {
      fs.readFile('test/data/private.pem', function(err, key) {
        assert.ifError(err, 'we have an error');

        var decrypted = crypto.privateDecrypt({
          key: key,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
        }, new Buffer(message1, 'base64'));

        assert.strictEqual(decrypted.toString('binary'), payload1.toString('binary'), 'the test string is sucessfully decrypted');

        done();
      });
    });

    it('should decrypt test string with PKCS1_V1_5 padding', function(done) {
      rsa.decrypt('test/data/private.pem', rsa.padding.PKCS1_V1_5, message2, function(err, decrypted) {
        assert.ifError(err, 'we have an error');

        assert.strictEqual(decrypted.toString('binary'), payload2.toString('binary'), 'the test string is sucessfully decrypted');

        done();
      });
    });

    it('should decrypt test string with PKCS1_V1_5 padding using crypto module', function(done) {
      fs.readFile('test/data/private.pem', function(err, key) {
        assert.ifError(err, 'we have an error');

        var decrypted = crypto.privateDecrypt({
          key: key,
          padding: crypto.constants.RSA_PKCS1_PADDING
        }, new Buffer(message2, 'base64'));

        assert.strictEqual(decrypted.toString('binary'), payload2.toString('binary'), 'the test string is sucessfully decrypted');

        done();
      });
    });

    it('should decrypt test string with OAEP_SHA_256_MGF1_SHA_1 padding', function(done) {
      rsa.decrypt('test/data/private.pem', rsa.padding.OAEP_SHA_256_MGF1_SHA_1, message3, function(err, decrypted) {
        assert.ifError(err, 'we have an error');

        assert.strictEqual(decrypted.toString('binary'), payload3.toString('binary'), 'the test string is sucessfully decrypted');

        done();
      });
    });
  });
});
