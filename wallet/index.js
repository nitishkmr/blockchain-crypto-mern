const { STARTING_BALANCE } = require('../config');
const { ec } = require('../util');

class Wallet {
  constructor() {
    this.balance = STARTING_BALANCE;
    const keyPair = ec.genKeyPair(); // private key and public key

    this.publicKey = keyPair.getPublic().encode('hex'); //without encode, it will return value in terms of x,y coordinates
  }
}

module.exports = Wallet;
