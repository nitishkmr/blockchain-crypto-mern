const { verifySignature } = require('../util');
const Wallet = require('./index');
const Transaction = require('./transaction');

describe('Transaction', () => {
  let transaction, senderWallet, recipientKey, amount;

  beforeEach(() => {
    // gen a dummy wallet
    senderWallet = new Wallet();
    recipientKey = 'recipient-public-key';
    amount = 50;

    transaction = new Transaction({ senderWallet, recipientKey, amount });
  });

  it('has an `id`', () => {
    expect(transaction).toHaveProperty('id');
  });

  describe('outputMap', () => {
    it('has an `outputMap', () => {
      expect(transaction).toHaveProperty('outputMap');
    });

    it('outputs the amount to the recipient', () => {
      expect(transaction.outputMap[recipientKey]).toEqual(amount);
    });

    it('outputs the remaining balance for the `senderWallet', () => {
      expect(transaction.outputMap[senderWallet.publicKey]).toEqual(
        senderWallet.balance - amount
      );
    });
  });

  describe('input', () => {
    it('has an `input`', () => {
      expect(transaction).toHaveProperty('input');
    });

    it('has a `timestamp` in the input', () => {
      expect(transaction.input).toHaveProperty('timestamp');
    });

    it('sets the `amount` to the `senderWallet` balance', () => {
      expect(transaction.input.amount).toEqual(senderWallet.balance);
    });

    it('sets the `address` to the `senderWallet` publicKey', () => {
      expect(transaction.input.address).toEqual(senderWallet.publicKey);
    });

    it('signs the input', () => {
      expect(
        verifySignature({
          publicKey: senderWallet.publicKey,
          data: transaction.outputMap,
          signature: transaction.input.signature,
        })
      ).toBe(true);
    });
  });

  describe('validTransaction', () => {
    let errorMock;
    beforeEach(() => {
      errorMock = jest.fn();
      global.console.error = errorMock;
    });
    describe('when the transaction is valid', () => {
      it('returns true', () => {
        expect(Transaction.validTransaction(transaction)).toBe(true);
      });
    });

    describe('when the transaction is invalid', () => {
      describe('and a transaction outputMap value is invalid', () => {
        it('returns false and logs error', () => {
          transaction.outputMap[senderWallet.publicKey] = 999999; // tampering data
          expect(Transaction.validTransaction(transaction)).toBe(false);
          expect(errorMock).toHaveBeenCalled();
        });
      });

      describe('and the transaction input signature is invalid', () => {
        it('returns false and logs error', () => {
          transaction.input.signature = new Wallet().sign('some fake data');
          expect(Transaction.validTransaction(transaction)).toBe(false);
          expect(errorMock).toHaveBeenCalled();
        });
      });
    });
  });

  describe('update()', () => {
    let originalSignature, originalSenderOutput, nextRecipient, nextAmount;

    beforeEach(() => {
      originalSignature = transaction.input.signature;
      originalSenderOutput = transaction.outputMap[senderWallet.publicKey];
      nextRecipientKey = 'next-recipient-key';
      nextAmount = 50;

      transaction.update({
        senderWallet,
        recipientKey: nextRecipientKey,
        amount: nextAmount,
      });
    });

    it('outputs the amount to the next recipient', () => {
      expect(transaction.outputMap[nextRecipientKey]).toEqual(nextAmount);
    });

    it('subtracts the amount from the original sender output amount', () => {
      expect(transaction.outputMap[senderWallet.publicKey]).toEqual(
        originalSenderOutput - nextAmount
      );
    });

    it('maintains a total output that matches the input amount', () => {
      expect(
        Object.values(transaction.outputMap).reduce(
          (total, outputAmount) => total + outputAmount
        )
      ).toEqual(transaction.input.amount);
    });

    it('re-signs the transaction', () => {
      expects(transaction.input.signature).not.toEqual(originalSignature);
    });
  });
});