const Transaction = require('./transaction');

class TransactionPool {
  constructor() {
    this.transactionMap = {};
  }

  clear() {
    console.log('CLEAR');
    this.transactionMap = {};
  }

  setTransaction(transaction) {
    this.transactionMap[transaction.id] = transaction;
  }

  // for syncup with other already existing transactionMaps
  setMap(transactionMap) {
    this.transactionMap = transactionMap;
  }

  // map through all the transactions in the pool and find if there is an existing transaction from the senderAddress
  existingTransaction({ inputAddress }) {
    const allTransactions = Object.values(this.transactionMap);
    return allTransactions.find(transaction => transaction.input.address === inputAddress);
  }

  // will filter out the invalid transactions
  validTransactions() {
    return Object.values(this.transactionMap).filter(transaction => {
      return Transaction.validTransaction(transaction);
    });
  }

  clearBlockchainTransactions({ chain }) {
    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];

      for (let transaction of block.data) {
        if (this.transactionMap[transaction.id]) {
          delete this.transactionMap[transaction.id];
        }
      }
    }
  }
}

module.exports = TransactionPool;
