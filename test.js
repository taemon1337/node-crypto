var fs = require('fs'),
    Cryptor = require('./cryptor'),
    cryptor = new Cryptor({})
    ;

var DATA = "hello world";

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
        console.warn("PASS: ", f3, " == ", DATA);
      } else {
        console.warn("FAIL: ", f3, " != ", DATA);
      }
      fs.unlinkSync(f1);
      fs.unlinkSync(f2);
      fs.unlinkSync(f3);
      console.log("####################################################################");
      if(cb) { cb() }
    });
  });
};

TestCryptor({ encrypt: true, passphrase: "" }, function() {
  TestCryptor({ encrypt: true, passphrase: "simple" }, function() {
    TestCryptor({ encrypt: true, passphrase: "1111111111111111111111111111111111111111111111111111111111111111:22222222222222222222222222222222" });
  });
});

