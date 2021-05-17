class TransactionPool {
  constructor() {
    this.transactionMap = {};
  }

  setTransaction(transaction) {
    this.transactionMap[transaction.if] = transaction;
  }
}

module.exports = TransactionPool;
