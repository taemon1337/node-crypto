var fs = require('fs'),
    Cryptor = require('./cryptor')
    ;


var cryptor = new Cryptor({ keylen: 256 }); // or try 128,192,256
var DATA = "hello world";

fs.writeFileSync("ciphers.txt", cryptor.getCiphers().join("\n"));

var CryptFile = function(infile, outfile, params, success) {
  var input = fs.createReadStream(infile);
  var output = fs.createWriteStream(outfile);
  var crypt = cryptor.crypt(input, params);

  output.on('close', function() {
    success(crypt.cryptor);
  });

  crypt.pipe(output);
};

var TestCryptor = function(params, cb) {
  var f1 = "hello.txt";
  var f2 = "hello.aes";
  var f3 = "hello.orig";
  var result = null;
  fs.writeFileSync(f1, DATA);

  CryptFile(f1, f2, params, function(params) {
    params.passphrase = params.iv ? [params.key,params.iv].join(params.sep) : params.key;
    params.encrypt = !params.encrypt;

    CryptFile(f2, f3, params, function(params) {
      if(DATA === fs.readFileSync(f3, { encoding: "utf8" })) {
        result = "PASS";
      } else {
        result = "--FAIL--";
      }
      fs.unlinkSync(f1);
      fs.unlinkSync(f2);
      fs.unlinkSync(f3);
      if(cb) { cb(params, result) }
    });
  });
};


var TestCiphers = function(ciphers, i, cb) {
  if(ciphers[i]) {
    try {
      var keylen = (m = ciphers[i].match(/(\d\d\d)/)) ? parseInt(m[1]) : 256;

      TestCryptor({ encrypt: true, passphrase: "simple", cipher: ciphers[i], keylen: keylen }, function(params, result) {
        console.log(result, ciphers[i]);
        cb(ciphers, i+1, TestCiphers);
      });
    } catch(err) {
      console.log("--ERROR--", ciphers[i]);
      cb(ciphers, i+1, TestCiphers);
    }

  }
}

/*
TestCryptor({ encrypt: true, passphrase: "" }, function(params, result) {
  console.log(result);
  TestCryptor({ encrypt: true, passphrase: "simple" }, function(params, result) {
    console.log(result);
    var key = Array(params.keylen*2/8+1).join("1");
    var iv = Array(16*2+1).join("2");
    TestCryptor({ encrypt: true, passphrase: [key,iv].join(params.sep) }, function(params, result) {
      console.log(result);
    });
  });
});
*/

console.log("Cipher Test:");
TestCiphers(cryptor.getCiphers(), 0, TestCiphers);

