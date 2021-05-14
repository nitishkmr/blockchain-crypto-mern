const uuid = require('uuid');
const { verifySignature } = require('../util');

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
      address: senderWallet.publicKey, // the address is the public key in these txs
      signature: senderWallet.sign(outputMap),
    };
  }

  static validTransaction(transaction) {
    const {
      input: { address, amount, signature },
      outputMap,
    } = transaction;

    const outputTotal = Object.values(outputMap).reduce(
      (total, outputAmount) => total + outputAmount
    );

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
}

module.exports = Transaction;
