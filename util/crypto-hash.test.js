const cryptoHash = require('./crypto-hash');

describe('cryptoHash()', () => {
  // to check if our function is producing correct sha256 hash
  it('generates a SHA-256 hashed output', () => {
    // we already have this hash equivalent of ' "foo" ' from online sha256 gen
    expect(cryptoHash('foo')).toEqual(
      'b2213295d564916f89a6a42455567c87c3f480fcd7a1c15e220f17d7169a790b'
    );
  });

  it('produces the same hash with the same input arguments in any order', () => {
    expect(cryptoHash('one', 'two', 'three')).toEqual(
      cryptoHash('one', 'three', 'two') //1,2,3 vs 1,3,2
    );
  });

  it('produces a unique hash when the properties have changed on an input', () => {
    const foo = {};
    const originalHash = cryptoHash(foo);
    foo['a'] = 'a';

    expect(cryptoHash(foo)).not.toEqual(originalHash);
  });
});
