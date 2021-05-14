// to store hardcoded and global values
const MINE_RATE = 1000; // in ms
const INITIAL_DIFFICULTY = 3;

const GENESIS_DATA = {
  timestamp: 1,
  lastHash: '-----',
  hash: 'hash-one',
  difficulty: INITIAL_DIFFICULTY,
  nonce: 0,
  data: [],
};

const STARTING_BALANCE = 1000; // as there needs to be some currency to start txs.

module.exports = { GENESIS_DATA, MINE_RATE, STARTING_BALANCE };
