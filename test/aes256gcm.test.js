'use strict';

/*global describe: true, it: true, before: true*/

var gcm = require('..').aes256gcm;

var assert = require('chai').assert;

describe('AES-256-GCM tests', function() {
  var key, iv, message1, message2, mac1, mac2;

  before(function(done) {
    // Warning: don't reuse key and iv in actual code
    gcm.keyGen(function(err, random) {
      assert.ifError(err);

      key = random.key;
      iv = random.iv;

      done();
    });
  });

  describe('encrypt', function() {
    it('should encrypt test string', function(done) {
      var buf = [];

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
      });

      cipher.on('end', function() {
        assert.instanceOf(cipher.mac, Buffer, 'a Buffer is returned as mac');
        mac1 = cipher.mac;
        message1 = Buffer.concat(buf, cipher.length);
        done();
      });

      cipher.end('foobar');
    });

    it('should encrypt test string with appended MAC', function(done) {
      var buf = [];

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
      });

      cipher.on('end', function() {
        mac2 = cipher.mac;
        message2 = Buffer.concat(buf, cipher.length);
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
