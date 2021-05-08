const { GENESIS_DATA } = require('./config');
const cryptoHash = require('./crypto-hash');

class Block {
  constructor({ timestamp, lastHash, hash, data }) {
    //{} is used so that later, order of the arguments won't bother
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
  }

  static genesis() {
    // return new this(GENESIS_DATA);
    return new Block(GENESIS_DATA);
  }

  static mineBlock({ lastBlock, data }) {
    const timestamp = Date.now();
    const lastHash = lastBlock.hash;

    return new this({
      timestamp, // timestamp: timestamp
      lastHash,
      data,
      hash: cryptoHash(timestamp, lastHash, data),
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
