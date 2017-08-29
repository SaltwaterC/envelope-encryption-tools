'use strict';

/*global describe: true, it: true, before: true*/

var crypto = require('crypto');

var gcm = require('../lib/main').aes256gcm;

var assert = require('chai').assert;

describe('AES-256-GCM tests', function() {
  var key, iv, message1, message2, mac1, mac2;

  before(function(done) {
    crypto.randomBytes(32, function(err, buf) {
      assert.ifError(err, 'we have an error');
      key = buf;
      crypto.randomBytes(12, function(err, buf) {
        assert.ifError(err, 'we have an error');
        iv = buf;
        done();
      });
    });
  });

  describe('encrypt', function() {
    it('should encrypt test string', function(done) {
      var buf = [];
      var len = 0;

      var cipher = gcm.encrypt({
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
        assert.instanceOf(cipher.mac, Buffer, 'a Buffer is returned as mac');
        mac1 = cipher.mac;
        message1 = Buffer.concat(buf, len);
        done();
      });

      cipher.end('foobar');
    });

    it('should encrypt test string with appended MAC', function(done) {
      var buf = [];
      var len = 0;

      var cipher = gcm.encrypt({
        key: key,
        iv: iv,
        appendMac: true
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
        mac2 = cipher.mac;
        message2 = Buffer.concat(buf, len);
        done();
      });

      cipher.end('bazqux');
    });
  });

  describe('decrypt', function() {
    it('should decrypt test string', function(done) {
      var decipher = gcm.decrypt({
        key: key,
        iv: iv,
        mac: mac1
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

      decipher.end(message1);
    });

    it('should decrypt test string with appended MAC', function(done) {
      var len = message2.length;
      var extractMsg = message2.slice(0, len - 16);
      var extractMac = message2.slice(len - 16, len);

      assert.strictEqual(extractMac.toString('hex'), mac2.toString('hex'), 'extracted MAC matches returned MAC');

      var decipher = gcm.decrypt({
        key: key,
        iv: iv,
        mac: extractMac
      });

      decipher.on('error', function(err) {
        assert.ifError(err, 'we have an error');
      });

      decipher.on('data', function(chunk) {
        assert.instanceOf(chunk, Buffer, 'a Buffer is passed as data event');
        assert.strictEqual(chunk.toString('utf8'), 'bazqux', 'the test string is sucessfully decrypted');
      });

      decipher.on('end', function() {
        done();
      });

      decipher.end(extractMsg);
    });
  });
});
