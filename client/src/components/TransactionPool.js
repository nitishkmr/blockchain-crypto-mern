import React, { Component } from 'react';
import Transaction from './Transaction';
import { Link } from 'react-router-dom';

class TransactionPool extends Component {
  state = { transactionPoolMap: {} }; // will take the poolMap from the transaction pool map endpoint (backend)

  fetchTransactionPoolMap = () => {
    fetch('http://localhost:3000/api/transaction-pool-map')
      .then(response => response.json())
      .then(json => this.setState({ transactionPoolMap: json }));
  };

  // since want to fetch the poolMap right away
  componentDidMount() {
    console.log('didmount');
    this.fetchTransactionPoolMap();
    this.forceUpdate();
  }

  getPool() {
    // console.log('obj' + Object.keys(this.state.transactionPoolMap).length);
    // if (!Object.keys(this.state.transactionPoolMap).length === 0) {
    return Object.values(this.state.transactionPoolMap).map(transaction => {
      return (
        <div key={transaction.id}>
          <Transaction transaction={transaction} />
          <hr className="light" />
        </div>
      );
    });
    // }

    // else return the button to make some transactions
    // return (
    //   <div>
    //     No recent transactions done
    //     <Link className="link" to="/conduct-transaction">
    //       Conduct a Transaction
    //     </Link>
    //   </div>
    // );
  }

  render() {
    return (
      <div className="TransactionPool">
        <Link className="link" to="/">
          Home
        </Link>
        <h3>Transaction Pool</h3>
        <hr className="light" />
        {this.getPool()}
      </div>
    );
  }
}

export default TransactionPool;
