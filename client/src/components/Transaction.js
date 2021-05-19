import React from 'react';

// Transactions can be shown from the Blocks also as well as TransactionPool also
const Transaction = ({ transaction }) => {
  const { input, outputMap } = transaction;
  const recipients = Object.keys(outputMap);

  return (
    <div className="Transaction">
      <div>
        From: {`${input.address.substring(0, 20)}...`} | Balance: {input.amount}
      </div>
      {recipients.map(recipient => {
        return (
          <div key={recipient}>
            To: {`${recipient.substring(0, 20)}...`} | Sent: {outputMap[recipient]}
          </div>
        );
      })}
    </div>
  );
};

export default Transaction;
