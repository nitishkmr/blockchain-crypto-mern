class Block {
  constructor({ timestamp, lastHash, hash, data }) {
    //{} is used so that later, order of the arguments won't bother
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
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
