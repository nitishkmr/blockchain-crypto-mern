const { GENESIS_DATA } = require('./config');
const cryptoHash = require('./crypto-hash');

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

  static mineBlock({ lastBlock, data }) {
    let hash, timestamp;
    // const timestamp = Date.now();
    const lastHash = lastBlock.hash;
    const { difficulty } = lastBlock; // refer to the difficulty of the last mined block... ultimately going to the Genesis Block

    let nonce = 0;
    do {
      // loop for changing nonce and recalculating hash
      nonce++;
      timestamp = Date.now();
      hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
    } while (hash.substring(0, difficulty) !== '0'.repeat(difficulty));

    return new this({
      timestamp, // timestamp: timestamp
      lastHash,
      data,
      difficulty,
      nonce,
      hash,
    });
  }
}

// const block1 = new Block({
//   data: 'data',
//   timestamp: '01/01/01',
//   lastHash: 'foo-lastHash',
//   hash: 'foo-hash',
// }); //cannot be reassigned

// console.log(block1);

module.exports = Block;
