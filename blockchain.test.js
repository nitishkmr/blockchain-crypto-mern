const Blockchain = require('./blockchain');
const Block = require('./block');

describe('Blockchain', () => {
  const blockchain = new Blockchain();

  // initial test - it
  // chain is the name of the array inside Block class
  it('contains a [`chain`-Array] instance', () => {
    expect(blockchain.chain instanceof Array).toBe(true);
  });

  it('starts with the genesis block', () => {
    expect(blockchain.chain[0]).toEqual(Block.genesis());
  });

  it('successfully adds a new block to the chain', () => {
    const newData = 'foo bar';
    blockchain.addBlock({ data: newData }); // timestamp, lastHash, hash would be created there only

    expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(newData);
  });
});
