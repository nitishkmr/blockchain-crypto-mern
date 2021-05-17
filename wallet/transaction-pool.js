class TransactionPool {
  constructor() {
    this.transactionMap = {};
  }

  setTransaction(transaction) {
    this.transactionMap[transaction.id] = transaction;
  }

  // map through all the transactions in the pool and find if there is an existing transaction from the senderAddress
  existingTransaction({ inputAddress }) {
    const allTransactions = Object.values(this.transactionMap);
    return allTransactions.find(
      (transaction) => transaction.input.address === inputAddress
    );
  }
}

module.exports = TransactionPool;
