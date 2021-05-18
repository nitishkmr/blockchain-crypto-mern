const Block = require('./block');
const cryptoHash = require('../util/crypto-hash');

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

  replaceChain(newChain, onSuccess) {
    if (newChain.length <= this.chain.length) {
      console.error('The incoming chain must be longer');
      return;
    }

    if (!Blockchain.isValidChain(newChain)) {
      console.error('The incoming chain mush be valid');
      return;
    }

    if (onSuccess) onSuccess();
    console.log('replacing chain with ', newChain);
    this.chain = newChain;
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
