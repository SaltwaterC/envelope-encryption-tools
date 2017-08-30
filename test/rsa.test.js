'use strict';

/*global describe: true, before: true, it: true*/

var crypto = require('crypto');

var rsa = require('../lib/main').rsa;

var assert = require('chai').assert;

describe('RSA tests', function() {
  var payload1, payload2, payload3, message1, message2, message3;

  before(function(done) {
    crypto.randomBytes(32, function(err, bytes) {
      assert.ifError(err);
      payload1 = bytes;
      crypto.randomBytes(32, function(err, bytes) {
        assert.ifError(err);
        payload2 = bytes;
        crypto.randomBytes(32, function(err, bytes) {
          assert.ifError(err);
          payload3 = bytes;
          done();
        });
      });
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

    it('should decrypt test string with PKCS1_V1_5 padding', function(done) {
      rsa.decrypt('test/data/private.pem', rsa.padding.PKCS1_V1_5, message2, function(err, decrypted) {
        assert.ifError(err, 'we have an error');

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
