'use strict';

/*global describe: true, it: true, before: true*/

var cbc = require('..').aes256cbc;

var assert = require('chai').assert;

describe('AES-256-GCM tests', function() {
  var key, iv, message;

  before(function(done) {
    // Warning: don't reuse key and iv in actual code
    cbc.keyGen(function(err, random) {
      assert.ifError(err);

      key = random.key;
      iv = random.iv;

      done();
    });
  });

  describe('encrypt', function() {
    it('should encrypt test string', function(done) {
      var buf = [];
      var len = 0;

      var cipher = cbc.encrypt({
        key: key,
        iv: iv
      });

      cipher.on('error', function(err) {
        assert.ifError(err, 'we have an error');
      });

      cipher.on('data', function(chunk) {
        assert.instanceOf(chunk, Buffer, 'a Buffer is passed as data event');
        buf.push(chunk);
        len += chunk.length;
      });

      cipher.on('end', function() {
        message = Buffer.concat(buf, len);
        done();
      });

      cipher.end('foobar');
    });
  });

  describe('decrypt', function() {
    it('should decrypt test string', function(done) {
      var decipher = cbc.decrypt({
        key: key,
        iv: iv
      });

      decipher.on('error', function(err) {
        assert.ifError(err, 'we have an error');
      });

      decipher.on('data', function(chunk) {
        assert.instanceOf(chunk, Buffer, 'a Buffer is passed as data event');
        assert.strictEqual(chunk.toString('utf8'), 'foobar', 'the test string is sucessfully decrypted');
      });

      decipher.on('end', function() {
        done();
      });

      decipher.end(message);
    });
  });
});
