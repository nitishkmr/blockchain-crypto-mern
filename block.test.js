// for jest
// "test": "jest --watchAll" in package.json and npm run test to run the test
const Block = require('./block');
const { GENESIS_DATA } = require('./config');

//test for a block
describe('Block', () => {
  const timestamp = 'a-date';
  const lastHash = 'foo-hash';
  const hash = 'bar-hash';
  const data = ['blockchain', 'data'];

  const block = new Block({
    timestamp, // timestamp : timestamp
    lastHash: lastHash,
    hash: hash,
    data: data,
  });

  test('has a timestamp, lastHash, hash, and data property', () => {
    expect(block.timestamp).toEqual(timestamp);
    expect(block.lastHash).toEqual(lastHash);
    expect(block.hash).toEqual(hash);
    expect(block.data).toEqual(data);
  });

  // test for genesis function - genesis() - describe to kinda combine the tests related to genesis block
  describe('genesis()', () => {
    const genesisBlock = Block.genesis(); // genesis is a static function of Block class

    // 1st test - we want that genesis block be an instance of Block
    it('returns a Block instance', () => {
      expect(genesisBlock instanceof Block).toBe(true);
    });

    // 2nd test
    it('returns the genesis data', () => {
      // important things here *** GENESIS_DATA is not an instance of a Block but genesisBlock is, then how can they be equal -> JS implements classes as objects and also GENESIS_DATA is itself an object but having same properties, so they can be compared.
      expect(genesisBlock).toEqual(GENESIS_DATA);
    });
  });

  // when we are mining the first block
  describe('mineBlock()', () => {
    const lastBlock = Block.genesis();
    const data = 'mined data';
    const minedBlock = Block.mineBlock(lastBlock, data); //again a static function

    it('returns a Block instance', () => {
      expect(minedBlock instanceof Block).toBe(true);
    });

    it('sets the `lastHash` to be the `hash` of the lastBlock', () => {
      expect(minedBlock.lastHash).toEqual(lastBlock.hash);
    });

    it('sets the `data`', () => {
      expect(minedBlock.data).toEqual(data);
    });

    it('sets a `timestamp`', () => {
      expect(minedBlock.timestamp).not.toEqual(undefined);
    });
  });
});
