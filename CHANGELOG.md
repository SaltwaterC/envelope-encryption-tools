## 0.1.3
 * Emit an error event from AES-256-GCM Decrypt if the tag length isn't the default 16 bytes / 128 bits.

## v0.1.2
 * Add length attribute for gcm.encrypt to simplify the MAC slicing when appendMac is on

## v0.1.1
 * Add support for loading passphrase protected RSA private keys

## v0.1.0
 * Initial release featuring RSA, AES-256-GCM, and AES-256-CBC support
