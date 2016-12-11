var fs = require('fs'),
    Cryptor = require('./cryptor')
    ;

var cryptor = new Cryptor({ keylen: 256 }); // or try 128,192,256
var DATA = "hello world";
var results = [];

var CryptFile = function(infile, outfile, params, success) {
  console.log({ infile: infile, outfile: outfile, params: params });
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
  fs.writeFileSync(f1, DATA);

  CryptFile(f1, f2, params, function(params) {
    var passphrase = params.iv ? [params.key,params.iv].join(params.sep) : params.key;

    CryptFile(f2, f3, { passphrase: passphrase, encrypt: !params.encrypt }, function(params) {
      if(DATA === fs.readFileSync(f3, { encoding: "utf8" })) {
        results.push("PASS");
      } else {
        result.push("FAIL");
      }
      fs.unlinkSync(f1);
      fs.unlinkSync(f2);
      fs.unlinkSync(f3);
      console.log("####################################################################");
      if(cb) { cb(params) }
    });
  });
};

TestCryptor({ encrypt: true, passphrase: "" }, function(params) {
  TestCryptor({ encrypt: true, passphrase: "simple" }, function(params) {
    var key = Array(params.keylen*2/8+1).join("1");
    var iv = Array(16*2+1).join("2");
    TestCryptor({ encrypt: true, passphrase: [key,iv].join(params.sep) }, function() {
      console.log("\n\nTest Results: ", results);
    });
  });
});

