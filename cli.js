var fs = require('fs'),
    Cryptor = require('./cryptor')
    ;

var parseArg = function(key) {
  var i = process.argv.indexOf("--"+key);
  return i !== -1 ? process.argv[i+1] : null;
};

var decrypt = parseArg("decrypt");
var key = parseArg("key") || null;
var pass = parseArg("pass") || "";
var cipher = parseArg("cipher") || "aes-256-cbc";
var keylen = parseArg("keylen") || 256;
var iv = parseArg("iv") || null;
var iterations = parseInt(parseArg("iterations") || "10000");
var salt = parseArg("salt") || null;
var data = parseArg("data") || "hello world";
var cmd = process.argv[process.argv.length-1];
var cryptor = new Cryptor({});

if(m = cipher.match(/(\d\d\d)/)) {
  keylen = parseInt(m[1]);
}

var CryptFile = function(infile, outfile, params, success) {
  console.log(params);
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
  fs.writeFileSync(f1, data);

  CryptFile(f1, f2, params, function(params) {
    params.passphrase = params.iv ? [params.key,params.iv].join(params.sep) : params.key;
    params.encrypt = !params.encrypt;

    CryptFile(f2, f3, params, function(params) {
      if(data === fs.readFileSync(f3, { encoding: "utf8" })) {
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


if(cmd === "test") {
  TestCryptor({
    encrypt: !decrypt,
    key: key,
    salt: salt,
    iv: iv,
    iterations: iterations,
    cipher: cipher,
    keylen: keylen
  }, function(params, result) {
    console.log( cipher, result);
  });
}


