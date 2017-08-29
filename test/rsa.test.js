'use strict';

/*global describe: true, it: true*/

var rsa = require('../lib/main').rsa;

var assert = require('chai').assert;

describe('RSA tests', function() {
  var message1, message2;

  describe('encrypt', function() {
    it('should encrypt test string', function(done) {
      rsa.encrypt('test/data/public.pem', new Buffer('foobar'), function(err, encrypted) {
        assert.ifError(err, 'we have an error');

        assert.isString(encrypted, 'a string is passed to the completion callback');
        message1 = encrypted;

        done();
      });
    });

    it('should encrypt test string with non-default padding', function(done) {
      rsa.encrypt('test/data/public.pem', rsa.padding.RSAES_PKCS1_V1_5, new Buffer('bazqux'), function(err, encrypted) {
        assert.ifError(err, 'we have an error');

        assert.isString(encrypted, 'a string is passed to the completion callback');
        message2 = encrypted;

        done();
      });
    });
  });

  describe('decrypt', function() {
    it('should decrypt test string', function(done) {
      rsa.decrypt('test/data/private.pem', message1, function(err, decrypted) {
        assert.ifError(err, 'we have an error');

        assert.strictEqual(decrypted.toString('utf8'), new Buffer('foobar').toString('utf8'), 'the test string is sucessfully decrypted');

        done();
      });
    });

    it('should decrypt test string with non-default padding', function(done) {
      rsa.decrypt('test/data/private.pem', rsa.padding.RSAES_PKCS1_V1_5, message2, function(err, decrypted) {
        assert.ifError(err, 'we have an error');

        assert.strictEqual(decrypted.toString('utf8'), new Buffer('bazqux').toString('utf8'), 'the test string is sucessfully decrypted');

        done();
      });
    });
  });
});
