const cryptoHash = require('./crypto-hash');

describe('cryptoHash()', () => {
  // to check if our function is producing correct sha256 hash
  it('generates a SHA-256 hashed output', () => {
    // we already have this hash equivalent of 'foo' from online sha256 gen
    expect(cryptoHash('foo')).toEqual(
      '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae'
    );
  });

  it('produces the same hash with the same input arguments in any order', () => {
    expect(cryptoHash('one', 'two', 'three')).toEqual(
      cryptoHash('one', 'three', 'two') //1,2,3 vs 1,3,2
    );
  });
});
