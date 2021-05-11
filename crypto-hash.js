const crypto = require('crypto');

// to return an SHA256 hash (should not depend on the order of the arguments)
const cryptoHash = (...inputs) => {
  //...inputs will gather all the inputs in a singe array
  const hash = crypto.createHash('sha256');
  hash.update(inputs.sort().join(' ')); // sorting so that the hash would depend only on the arguments and not on their order
  return hash.digest('hex'); //digest represents the result of hash - here in hex format
};

// Difficulty level will be increased if using binary as initially difficulty = 1 is set
// i.e. starting from only one leading 0, easy to compute

module.exports = cryptoHash;
