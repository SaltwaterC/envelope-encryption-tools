## About [![build status](https://secure.travis-ci.org/SaltwaterC/envelope-encryption-tools.png?branch=master)](https://travis-ci.org/SaltwaterC/envelope-encryption-tools)

Lightweight encryption toolkit to support envelope encryption schemes. It was implemented for supporting Amazon S3 client-side encryption in node.js i.e it can produce a cipher stream which may be decrypted by the AWS SDK's which implement the client-side encryption (Java, Ruby, Go). However, the implementation itself is general purpose. In fact, it uses the node.js defaults which don't really match the defaults in Amazon's libraries. The scope isn't restricted to the envelope encryption schemes supported by Amazon.

## System requirements

 * node.js 6+
 * [node-forge](https://github.com/digitalbazaar/forge) 0.7.1

## Implemented tools

### RSA encryption / decryption

Wraps the asymmetric encryption / decryption capabilities of [node-forge](https://github.com/digitalbazaar/forge). The core crypto module doesn't support Java's RSA/ECB/OAEPWithSHA-256AndMGF1Padding. The use case for envelope encryption is to encrypt with the RSA public key the symmetric key used to encrypt the actual data, then destroy the original symmetric encryption key. Then the only way to decrypt the data is to decrypt the symmetric key using the RSA private key - provided there's no way to factor the private key for the chosen length.

Examples:

```javascript
var rsa = require('envelope-encryption-tools').rsa;

// uses the default node.js padding, rsa.padding.OAEP default
// rsa.padding.OAEP is equal to crypto.constants.RSA_PKCS1_OAEP_PADDING
// crypto.constants.RSA_PKCS1_OAEP_PADDING is actually equal to Number 4
rsa.encrypt('path/to/public-key.pem', new Buffer('message1'), function(err, encrypted1) {
  if(err) {
    return callback(err);
  }
  callback(null, encrypted1); // encrypted1 is a base64 encoded String
});

// uses the default padding in Ruby / AWS SDK for Ruby / AWS SDK for Java
// rsa.padding.PKCS1_V1_5 is equal to crypto.constants.RSA_PKCS1_PADDING
// crypto.constants.RSA_PKCS1_PADDING is actually equal to Number 1
rsa.encrypt('path/to/public/key.pem', rsa.padding.PKCS1_V1_5, new Buffer('message2'), function(err, encrypted) {
  // [...]
});

rsa.decrypt('path/to/private-key.pem', 'encrypted1', function(err, decrypted1) {
  if(err) {
    return callback(err);
  }
  callback(null, decrypted1); // decrypted1 is a Buffer
});

// the padding used to encrypt must match the padding used to decrypt
rsa.decrypt('path/to/private-key.pem', rsa.padding.PKCS1_V1_5, 'encrypted2', function(err, decrypted2) {
  // [...]
});
```

### AES-256-GCM encryption / decryption streams

Wraps aes-256-gcm cipher in a duplex Stream. It appears that `crypto.createCipheriv` is a factory which returns a Stream object when in fact, it isn't. Some ciphers, notably aes-256-gcm (DUH), don't create node.js duplex streams with `crypto.createCipheriv` which makes aes-256-gcm tad difficult to be used in a pipeline. Basically `crypto.createCipheriv` is wrapped as a `stream.Transform` child.

This is different from the [aes-gcm-stream](https://github.com/MattSurabian/aes-gcm-stream) module though. While it robs few good ideas from where, notably the `stream.Transform` wrappers, it doesn't make any of the assumptions made there: the IV/nonce isn't prepended to the stream, the IV/nonce size isn't assumed to be 96 bits (i.e it accepts an arbitrary value, per GCM spec - provided that node.js supports it), the MAC appending to the stream is optional. It acts like an actual stream, rather than buffering the cipher stream in memory as the goal is to use this in a streaming pipeline with objects which are much larger than the available memory. In a pipeline with gzip compression before encryption it has been revealed that the memory consumption stays around 100 MB. The maximum object size is 64 GiB due to GCM's limitation.

This introduces the issue of storing the MAC separately for streams of unknown size or streams where the last 16 bytes can't be read via a range read, however, this is much better than having to buffer the whole cipher stream in memory. For anything else, is better to enable `appendMac`.

Amazon S3 supports range requests which is part of the HTTP spec. Their SDK's use this feature to read the appended MAC and the cipher stream without the MAC to be passed to the decryption routine.

If the stream ends up in a file, then it is a matter of reading the MAC before decryption:

```javascript
// don't use blocking code in actual production code - I'm using sync calls for brevity
// aes-256-gcm uses the 16 bytes / 128 bit tags - i.e the length of the MAC
var mac = new Buffer(16);
var size = fs.statSync('file.encrypted').size;
var mfd = fs.openSync('file.encrypted', 'r');
fs.readSync(mfd, mac, 0, 16, size - 16); // put the last 16 bytes in the mac Buffer
```

The file read stream must not include the MAC:

```javascript
var r = fs.createReadStream('file.encrypted', {
  start: 0,
  end: size - 16 - 1 // using 16 as a separate value, rather than 17, to point out the MAC size
});
```

Examples:

```javascript
var crypto = require('crypto');
var gcm = require('envelope-encryption-tools').aes256gcm;

// generate 256 bit key
var key = crypto.randomBytes(32); // warning: blocking call without the second callback arg
// generate 96 bit IV/nonce - 96 bits is a recommended value, some node.js versions used to enforce this
// https://github.com/nodejs/node/pull/6376 - 96 bits still appears to be a minimum value in node.js
var iv = crypto.randomBytes(12); // warning: blocking call without the second callback arg

// the MAC isn't appended to the stream
var cipher = gcm.encrypt({
  key: key,
  iv: iv
}); // this is a duplex Stream object - input plain text - output cipher stream

// to get the MAC, attach an end event listener
cipher.on('end', function() {
  console.log(cipher.mac); // the MAC is only available after the cipher stream is finished
});

// the MAC is automatically appended to the stream - this isn't the default as the decryption isn't a trivial exercise
var cipher = gcm.encrypt({
  key: key,
  iv: iv,
  appendMac: true // must be Boolean true to enable
}); // this is a duplex Stream object - input plain text - output cipher stream + MAC

// the decryption stream
var decipher = gcm.decrypt({
  key: key,
  iv: iv,
  mac: mac // must be fetched from separate storage or from the end of the cipher stream if it was appended
});
```
