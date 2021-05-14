const uuid = require('uuid');

class Transaction {
  constructor({ senderWallet, recipientKey, amount }) {
    this.id = uuid.v1();
    this.outputMap = this.createOutputMap({
      senderWallet,
      recipientKey,
      amount,
    });
    this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
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
      address: senderWallet.publicKey,
      signature: senderWallet.sign(outputMap),
    };
  }
}

module.exports = Transaction;
