import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import Transaction from './Transaction';

class Block extends Component {
  state = { displayTransaction: false };

  toggleTransaction = () => {
    this.setState({ displayTransaction: !this.state.displayTransaction });
  };

  get displayTransaction() {
    // like normal function only, but here no need to use () to call this, also, in normal function, everytime the re-render is there, this function will also be called everytime
    const { data } = this.props.block;

    const stringifiedData = JSON.stringify(data);
    const dataDisplay = stringifiedData.length > 15 ? `${stringifiedData.substring(0, 35)}...` : stringifiedData;

    if (this.state.displayTransaction) {
      // to print full info
      return (
        <div>
          {data.map(transaction => (
            <div key={transaction.id}>
              <hr />
              <Transaction transaction={transaction} />
            </div>
          ))}
          <br />
          <Button bsStyle="danger" bsSize="small" onClick={this.toggleTransaction}>
            Show Less
          </Button>
        </div>
      );
    }

    return (
      <div>
        <div>Data: {dataDisplay}</div>
        <Button bsStyle="danger" bsSize="small" onClick={this.toggleTransaction}>
          Show More
        </Button>
      </div>
    );
  }

  render() {
    const { timestamp, hash } = this.props.block;
    const hashDisplay = `${hash.substring(0, 15)}...`;

    return (
      <div className="Block">
        <div>Hash: {hashDisplay}</div>
        <div>Timestamp: {new Date(timestamp).toLocaleDateString()}</div>
        {this.displayTransaction}
      </div>
    );
  }
}

export default Block;
