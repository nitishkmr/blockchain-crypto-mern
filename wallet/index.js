const { STARTING_BALANCE } = require('../config');
const { ec, cryptoHash } = require('../util');
const Transaction = require('./transaction');

class Wallet {
  constructor() {
    this.balance = STARTING_BALANCE;
    this.keyPair = ec.genKeyPair(); // private key and public key

    this.publicKey = this.keyPair.getPublic().encode('hex'); //without encode, it will return value in terms of x,y coordinates
  }

  sign(data) {
    return this.keyPair.sign(cryptoHash(data));
  }

  createTransaction({ recipient, amount }) {
    if (amount > this.balance) {
      throw new Error('Amount exceeds balance');
    }

    const tx = new Transaction({
      senderWallet: this,
      recipientKey: recipient,
      amount,
    });
    // console.log(tx);
    return tx;
  }
}

module.exports = Wallet;
