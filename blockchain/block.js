const { GENESIS_DATA, MINE_RATE } = require('../config');
const cryptoHash = require('../util/crypto-hash');
const hexToBinary = require('hex-to-binary'); // since Bitcoin uses binary format to form proof of work hashes

class Block {
  constructor({ timestamp, lastHash, hash, data, nonce, difficulty }) {
    //{} is used so that later, order of the arguments won't bother
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
    this.nonce = nonce;
    this.difficulty = difficulty;
  }

  static genesis() {
    // return new this(GENESIS_DATA);
    return new Block(GENESIS_DATA);
  }

  // Mining - to do that proof of work - do CPU work to find hashes acc to the difficulty
  static mineBlock({ lastBlock, data }) {
    const lastHash = lastBlock.hash;
    let hash, timestamp;
    let { difficulty } = lastBlock; // refer to the difficulty of the last mined block... ultimately going to the Genesis Block
    let nonce = 0;

    do {
      // loop for changing nonce and recalculating hash
      nonce++;
      timestamp = Date.now();
      difficulty = Block.adjustDifficulty({
        originalBlock: lastBlock,
        newBlockTimestamp: timestamp,
      });
      hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
    } while (hexToBinary(hash).substring(0, difficulty) !== '0'.repeat(difficulty));

    return new this({
      timestamp, // timestamp: timestamp
      lastHash,
      data,
      difficulty,
      nonce,
      hash,
    });
  }

  static adjustDifficulty({ originalBlock, newBlockTimestamp }) {
    const { difficulty } = originalBlock;
    if (difficulty < 1) return 1;

    const difference = newBlockTimestamp - originalBlock.timestamp;
    // console.log(difference);
    if (difference > MINE_RATE) return difficulty - 1; // => slpw mining
    return difficulty + 1; // quick mining
  }
}

module.exports = Block;
