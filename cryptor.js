var fs = require('fs'),
    crypto = require('crypto')
    ;

var Cryptor = function(opts) {
  this.sep = opts.sep || ":";
  this.iterations = opts.iterations || 10000; // only for simple passphrase
  this.salt = opts.salt || "1234567890abcdef1234567890abcdef"; // only for simple passphrase
  this.iv = opts.iv || "1234567890abcdef1234567890abcdef"; // only for simple passphrase
}

Cryptor.prototype = {
  crypt: function(stream, formdata) {
    if(formdata.encrypt) {
      return this.encrypt(stream, formdata);
    } else {
      return this.decrypt(stream, formdata);
    }
  },
  encrypt: function(stream, formdata) {
    var cipher = null;
    var data = this.parseFormData(formdata);

    if(data.iv) {
      console.log("Encryption Params: ", data);
      cipher = crypto.createCipheriv(data.cipher, new Buffer(data.key,'hex'), new Buffer(data.iv,'hex'));
    } else {
      console.log("Encryption Params: ", data);
      cipher = crypto.createCipher(data.cipher, new Buffer(data.key,'hex'));
    }

    cipher.cryptor = data;
    return stream.pipe(cipher);
  },
  decrypt: function(stream, formdata) {
    var cipher = null;
    var data = this.parseFormData(formdata);

    if(data.iv) {
      console.log("Decryption Params: ", data);
      cipher = crypto.createDecipheriv(data.cipher, new Buffer(data.key, 'hex'), new Buffer(data.iv, 'hex'));
    } else {
      console.log("Decryption Params: ", data);
      cipher = crypto.createDecipher(data.cipher, new Buffer(data.key, 'hex'));
    }

    cipher.cryptor = data;
    return stream.pipe(cipher);
  },
  parseFormData: function(formdata) {
    var key = null;
    var iv = null;
    var salt = null;
    var iterations = null;
    var keylen = formdata.keylen || 256;
    var cipher = formdata.cipher || ["aes",keylen,"cbc"].join('-');
    var encrypt = formdata.encrypt;

    // passphrase can be blank, contain a simple string, or '<key:iv>'
    if(!formdata.passphrase) {
      // passphrase is blank, so generate key for user
      console.log("Generating <key:iv> for user");
      salt = crypto.randomBytes(keylen/8).toString('hex'); 
      iterations = formdata.iterations || this.iterations;
      key = crypto.pbkdf2Sync(crypto.randomBytes(keylen/8), salt, iterations, keylen/8, 'sha512').toString('hex');
      iv = crypto.randomBytes(keylen/16).toString('hex');
    } else if(formdata.passphrase.indexOf(this.sep) === -1) {
      // passphrase does not contain sep, so its a simple string
      console.log("Simple Passphrase: ", formdata.passphrase);
      key = formdata.passphrase;
    } else {
      // passphrase is 'key:iv'
      console.log("Parsing key and iv from passphrase", formdata.passphrase);
      key = formdata.passphrase.split(this.sep)[0];
      iv = formdata.passphrase.split(this.sep)[1];
    }

    return {
      cipher: cipher,
      key: key,
      salt: salt,
      iterations: iterations,
      iv: iv,
      keylen: keylen,
      sep: this.sep,
      encrypt: encrypt
    }
  }
};

module.exports = Cryptor;
