const { STARTING_BALANCE } = require('../config');
const { ec, cryptoHash } = require('../util');

class Wallet {
  constructor() {
    this.balance = STARTING_BALANCE;
    this.keyPair = ec.genKeyPair(); // private key and public key

    this.publicKey = this.keyPair.getPublic().encode('hex'); //without encode, it will return value in terms of x,y coordinates
  }
  sign(data) {
    return this.keyPair.sign(cryptoHash(data));
  }
}

module.exports = Wallet;
