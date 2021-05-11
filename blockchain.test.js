const Blockchain = require('./blockchain');
const Block = require('./block');

describe('Blockchain', () => {
  let blockchain, newChain, originalChain;

  beforeEach(() => {
    // this is used to run something before any test
    // we need different instance of blockchain as they will be tampered while going through the testcases
    blockchain = new Blockchain();
    newChain = new Blockchain();
    originalChain = blockchain.chain;
  });

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

  describe('isValidChain()', () => {
    describe('when the chain does not start with the genesis block', () => {
      it('returns false', () => {
        //recreating the scenario if genesis block is changed or not there
        blockchain.chain[0] = { data: 'fake-genesis' };
        expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
      });
    });

    describe('when the chain starts with the genesis block and has multiple blocks', () => {
      beforeEach(() => {
        blockchain.addBlock({ data: 'Bruce' });
        blockchain.addBlock({ data: 'Batman' });
        blockchain.addBlock({ data: 'Wayne' });
      });
      describe('and a lastHash reference has changed', () => {
        it('returns false', () => {
          // blockchain.addBlock({ data: 'Bruce' });
          // blockchain.addBlock({ data: 'Batman' });
          // blockchain.addBlock({ data: 'Wayne' });

          blockchain.chain[2].lastHash = 'broken-lastHash';
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
      });

      describe('and the chain contains a block with an invalid field', () => {
        it('returns false', () => {
          // blockchain.addBlock({ data: 'Bruce' });
          // blockchain.addBlock({ data: 'Batman' });
          // blockchain.addBlock({ data: 'Wayne' });

          blockchain.chain[2].data = 'broken-data';
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
      });

      describe('and the chain does not contain any invalid blocks', () => {
        it('retruns true', () => {
          // blockchain.addBlock({ data: 'Bruce' });
          // blockchain.addBlock({ data: 'Batman' });
          // blockchain.addBlock({ data: 'Wayne' });

          // no modifications here
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
        });
      });
    });
  });

  describe('replaceChain()', () => {
    let errorMock, logMock;
    beforeEach(() => {
      errorMock = jest.fn();
      logMock = jest.fn();
      global.console.error = errorMock;
      global.console.log = logMock;
    }); // for not printing the console error and logs in the test running screen.

    describe('when the new chain is not longer', () => {
      beforeEach(() => {
        newChain.chain[0] = { new: 'chain' }; //else the newChain would've been = the blockchain
        blockchain.replaceChain(newChain.chain);
      });

      it('does not replace the chain', () => {
        expect(blockchain.chain).toEqual(originalChain);
      });

      it('logs an error', () => {
        // not important
        expect(errorMock).toHaveBeenCalled();
      });
    });

    describe('when the chain is longer', () => {
      beforeEach(() => {
        newChain.addBlock({ data: 'Bruce' });
        newChain.addBlock({ data: 'Batman' });
        newChain.addBlock({ data: 'Wayne' });
      });

      describe('and the chain is invalid', () => {
        beforeEach(() => {
          newChain.chain[2].hash = 'fake-hash';
          blockchain.replaceChain(newChain.chain);
        });
        it('does not replace the chain', () => {
          expect(blockchain.chain).toEqual(originalChain);
        });

        it('logs an error', () => {
          expect(errorMock).toHaveBeenCalled();
        });
      });

      describe('and the chain is valid', () => {
        beforeEach(() => {
          blockchain.replaceChain(newChain.chain);
        });

        it('replaces the chain', () => {
          expect(blockchain.chain).toEqual(newChain.chain);
        });

        it('logs about the chain replacement', () => {
          expect(logMock).toHaveBeenCalled();
        });
      });
    });
  });
});
