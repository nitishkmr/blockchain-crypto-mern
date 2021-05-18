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

  createTransaction({ recipient, amount, chain }) {
    if (chain) {
      this.balance = Wallet.calculateBalance({
        chain,
        address: this.publicKey,
      });
    }
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

  // to do the starting balance check, checks the output maps of txs and if any amount is desginated, then adds to the STARTING_BALANCE
  static calculateBalance({ chain, address }) {
    let outputsTotal = 0;
    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      for (let transaction of block.data) {
        const addressOutput = transaction.outputMap[address];

        if (addressOutput) {
          outputsTotal = outputsTotal + addressOutput;
        }
      }
    }
    return STARTING_BALANCE + outputsTotal;
  }
}

module.exports = Wallet;
