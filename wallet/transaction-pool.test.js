const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
const Wallet = require('./index');
const Blockchain = require('../blockchain');

describe('TransactionPool', () => {
  let transactionPool, transaction, senderWallet;

  beforeEach(() => {
    transactionPool = new TransactionPool();
    senderWallet = new Wallet();
    transaction = new Transaction({
      senderWallet,
      recipient: 'fake-recipient',
      amount: 50,
    });
  });

  describe('setTransaction()', () => {
    it('adds a transaction', () => {
      transactionPool.setTransaction(transaction);

      expect(transactionPool.transactionMap[transaction.id]).toBe(transaction);
    });
  });

  describe('existingTransaction()', () => {
    it('returns an existing transaction given an input address', () => {
      transactionPool.setTransaction(transaction);

      expect(
        transactionPool.existingTransaction({
          inputAddress: senderWallet.publicKey,
        })
      ).toBe(transaction);
    });
  });

  describe('validTransactions()', () => {
    let validTransactions, errorMock;

    beforeEach(() => {
      validTransactions = [];
      errorMock = jest.fn();
      global.console.error = errorMock;

      // loop to make some valid and some random invalid transactions
      for (let i = 0; i < 10; i++) {
        transaction = new Transaction({
          senderWallet,
          recipientKey: 'any-recipient',
          amount: 30,
        });

        if (i % 3 === 0) {
          // amount invalid
          transaction.input.amount = 999999;
        } else if (i % 3 === 1) {
          // signature invalid
          transaction.input.signature = new Wallet().sign('foo');
        } else {
          validTransactions.push(transaction);
        }

        transactionPool.setTransaction(transaction);
      }
    });

    it('returns valid transaction', () => {
      expect(transactionPool.validTransactions()).toEqual(validTransactions);
    });

    it('logs errors for the invalid transactions', () => {
      transactionPool.validTransactions();
      expect(errorMock).toHaveBeenCalled();
    });
  });

  // to clear transaction pool ( when the valid txs are mined by miners )
  describe('clear()', () => {
    it('clears the transactions', () => {
      transactionPool.clear();

      expect(transactionPool.transactionMap).toEqual({});
    });
  });

  // which transactions to be cleared from the pool when some of them are mined and added to blockchain
  describe('clearBlockchainTransactions()', () => {
    it('clears the pool of any existing blockchain transactions', () => {
      const blockchain = new Blockchain();
      const expectedTransactionMap = {};

      for (let i = 0; i < 6; i++) {
        const transaction = new Wallet().createTransaction({
          recipient: 'foo',
          amount: 20,
        });

        // all the transactions will go in the pool
        transactionPool.setTransaction(transaction);

        if (i % 2 === 0) {
          // adding half of the txs to the blockchain
          blockchain.addBlock({ data: [transaction] });
        } else {
          // remaining ones are copied in expected Map
          expectedTransactionMap[transaction.id] = transaction;
        }
      }

      // this should clear all the txs from the pool which are mined and added to blockchain, rest should be left
      transactionPool.clearBlockchainTransactions({ chain: blockchain.chain });

      expect(transactionPool.transactionMap).toEqual(expectedTransactionMap);
    });
  });
});
