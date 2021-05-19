import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import Transaction from './Transaction';
import { Link } from 'react-router-dom';
import { Toast } from 'toaster-js';

const POLL_INTERVAL_MS = 5000;

class TransactionPool extends Component {
  state = { transactionPoolMap: {} }; // will take the poolMap from the transaction pool map endpoint (backend)

  fetchTransactionPoolMap = () => {
    fetch(`${document.location.origin}/api/transaction-pool-map`)
      .then(response => response.json())
      .then(json => this.setState({ transactionPoolMap: json }));
  };

  fetchMineTransations = () => {
    fetch(`${document.location.origin}/api/mine-transactions`).then(response => {
      if (response.status === 200) {
        new Toast('Success', Toast.TYPE_DONE, 2000);
        this.props.history.push('/blocks');
      } else {
        new Toast('The mine-transactions block request did not complete', Toast.TYPE_ERROR, 2000);
      }
    });
  };

  // since want to fetch the poolMap right away
  componentDidMount() {
    // console.log('didmount');
    this.fetchTransactionPoolMap();
    this.fetchPoolMapInterval = setInterval(() => this.fetchTransactionPoolMap(), POLL_INTERVAL_MS);
  }

  componentWillUnmount() {
    clearInterval(this.fetchPoolMapInterval); // as even if different page is loaded, then also the setInterval keeps on going
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
        <Button bsStyle="danger" onClick={this.fetchMineTransations}>
          Mine the Transactions
        </Button>
      </div>
    );
  }
}

export default TransactionPool;
