var fs = require('fs'),
    crypto = require('crypto'),
    decrypt = process.argv.indexOf('--decrypt'),
    ivi = process.argv.indexOf('--iv'),
    pi = process.argv.indexOf('--pass'),
    haskey = process.argv.indexOf('--key'),
    keyli = process.argv.indexOf('--keysize'),
    out = process.argv.indexOf('--out'),
    infile = process.argv[process.argv.length-1],
    outfile = infile
    ;

var cipher = null;
var iv = null;
var pass = null;
var key = null;
var salt = 'salt';
var keylen = null;

if(keyli !== -1) {
  keylen = parseInt(process.argv[keyli+1]);
} else {
  keylen = 256;
}

if(ivi !== -1) {
  iv = process.argv[ivi+1];
} else {
  iv = crypto.randomBytes(16).toString('hex');
}

if(pi !== -1) {
  pass = process.argv[pi+1];
} else {
  pass = 'password'; // a tip from chip
}

console.log("Input File: ", infile);
console.log("Init Vector: ", iv);

if(haskey !== -1) {
  key = process.argv[haskey+1];
} else {
  key = crypto.pbkdf2Sync(pass, salt, 10000, keylen/8, 'sha512').toString('hex');
}

console.log((decrypt ? "Decryption Key: " : "Encryption Key: "), key);

if(decrypt !== -1) {
  cipher = crypto.createDecipheriv('aes-'+keylen+'-cbc', new Buffer(key,'hex'), new Buffer(iv,'hex'));
  outfile = outfile.endsWith(".aes") ? outfile.replace(".aes","") : outfile+".decrypted"
} else {
  cipher = crypto.createCipheriv('aes-'+keylen+'-cbc', new Buffer(key,'hex'), new Buffer(iv,'hex'));
  outfile += ".aes"
}

if(out !== -1) {
  outfile = process.argv[out+1];
}

console.log("Output File: ", outfile);

fs.createReadStream(infile).pipe(cipher).pipe(fs.createWriteStream(outfile));




