const crypto = require('crypto');

const cryptoHash = (...inputs) => {
  //...inputs will gather all the inputs in a singe array
  const hash = crypto.createHash('sha256');
  hash.update(inputs.sort().join(' ')); // sorting so that the hash would depend only on the arguments and not on their order
  return hash.digest('hex'); //digest represents the result of hash
};

module.exports = cryptoHash;
