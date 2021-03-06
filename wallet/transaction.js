const uuid = require('uuid');
const { verifySignature } = require('../util');
const { REWARD_INPUT, MINING_REWARD } = require('../config');

// Transactions – Objects [  ] that capture the info behind the exchange of currency between two individuals in the. Only wallet should be able to create txs.
//          Input field – Provides details about the sender, contains the timestamp, balance, amount to be sent, signature and the sender’s public key
//          Output field – How much currency the sender wants to send, an output is also sent to the sender themselves to specify how much currency should the sender have after the tx.

class Transaction {
  constructor({ senderWallet, recipientKey, amount, outputMap, input }) {
    this.id = uuid.v1();
    this.outputMap = outputMap || this.createOutputMap({ senderWallet, recipientKey, amount });
    this.input = input || this.createInput({ senderWallet, outputMap: this.outputMap });
  }

  // to store details for multiple recepients(if there are) of a single transaction.
  createOutputMap({ senderWallet, recipientKey, amount }) {
    const outputMap = {};

    outputMap[recipientKey] = amount;
    outputMap[senderWallet.publicKey] = senderWallet.balance - amount;
    return outputMap;
  }

  createInput({ senderWallet, outputMap }) {
    return {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey, // the address is the public key in these txs
      signature: senderWallet.sign(outputMap),
    };
  }

  update({ senderWallet, recipientKey, amount }) {
    if (amount > this.outputMap[senderWallet.publicKey]) {
      throw new Error('Amount exceeds balance');
    }

    if (!this.outputMap[recipientKey]) {
      this.outputMap[recipientKey] = amount;
    } else {
      this.outputMap[recipientKey] = this.outputMap[recipientKey] + amount;
    }

    this.outputMap[senderWallet.publicKey] = this.outputMap[senderWallet.publicKey] - amount;

    this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
  }

  static validTransaction(transaction) {
    const {
      input: { address, amount, signature },
      outputMap,
    } = transaction;

    const outputTotal = Object.values(outputMap).reduce((total, outputAmount) => total + outputAmount);

    // all the output values, i.e. for all the recepients of a tx, the total should match the amount
    if (amount !== outputTotal) {
      console.error(`Invalid transaction from ${address}`);
      return false;
    }

    if (!verifySignature({ publicKey: address, data: outputMap, signature })) {
      console.error(`Invalid signature from ${address}`);
      return false;
    }
    return true;
  }

  static rewardTransaction({ minerWallet }) {
    return new this({
      input: REWARD_INPUT,
      outputMap: { [minerWallet.publicKey]: MINING_REWARD },
    });
  }
}

module.exports = Transaction;
