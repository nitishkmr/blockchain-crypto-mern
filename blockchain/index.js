const Block = require('./block');
const Transaction = require('../wallet/transaction');
const Wallet = require('../wallet');
const { cryptoHash } = require('../util');
const { REWARD_INPUT, MINING_REWARD } = require('../config');

class Blockchain {
  constructor() {
    this.chain = [Block.genesis()];
  }
  addBlock({ data }) {
    const newBlock = Block.mineBlock({
      lastBlock: this.chain[this.chain.length - 1],
      data,
    });
    this.chain.push(newBlock);
  }

  replaceChain(newChain, validateTransactions, onSuccess) {
    if (newChain.length <= this.chain.length) {
      console.error('The incoming chain must be longer');
      return;
    }

    if (!Blockchain.isValidChain(newChain)) {
      console.error('The incoming chain mush be valid');
      return;
    }

    // don't replace the chain if incoming chain has invalid data
    if (validateTransactions && !this.validTransactionData({ newChain })) {
      console.error('The incoming chain has invalid data');
      return;
    }

    if (onSuccess) onSuccess();
    // console.log('replacing chain with ', newChain);
    this.chain = newChain;
  }

  validTransactionData({ chain }) {
    if (chain)
      for (let i = 1; i < chain.length; i++) {
        const block = chain[i];
        const transactionSet = new Set(); // for non duplicate transactions
        let rewardTransactionCount = 0;

        for (let transaction of block.data) {
          if (transaction.input.address === REWARD_INPUT.address) {
            rewardTransactionCount += 1;

            if (rewardTransactionCount > 1) {
              console.error('Miner rewards exceed limit');
              return false;
            }

            // checking for invalid miner transaction
            if (Object.values(transaction.outputMap)[0] !== MINING_REWARD) {
              console.error('Miner reward amount is invalid');
              return false;
            }
          } else {
            if (!Transaction.validTransaction(transaction)) {
              console.error('Invalid transaction');
              return false;
            }

            const trueBalance = Wallet.calculateBalance({
              chain: this.chain, // and not 'chain' received in this function
              address: transaction.input.address,
            });

            if (transaction.input.amount !== trueBalance) {
              console.error('Invalid input amount');
              return false;
            }

            if (transactionSet.has(transaction)) {
              console.error('An identical transaction appears more than once in the block');
              return false;
            } else {
              transactionSet.add(transaction);
            }
          }
        }
      }

    return true;
  }

  static isValidChain(chain) {
    // check for the genesis block
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
      return false; // direct checking of objects won't work in JS
    }

    // for checking if hash / data has not been tampered
    for (let i = 1; i < chain.length; i++) {
      const { timestamp, lastHash, hash, data, nonce, difficulty } = chain[i];
      const actualLastHash = chain[i - 1].hash;
      const lastDifficulty = chain[i - 1].difficulty;

      if (lastHash !== actualLastHash) return false;

      const validatedHash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
      if (hash !== validatedHash) return false;
      if (Math.abs(lastDifficulty - difficulty) > 1) return false; // to prevent large difficulty jumps when new block is mined(added)
    }
    return true;
  }
}

module.exports = Blockchain;
