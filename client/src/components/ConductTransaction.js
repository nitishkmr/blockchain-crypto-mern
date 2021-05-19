import React, { Component } from 'react';
import { FormGroup, FormControl, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Toast } from 'toaster-js';

class ConductTransaction extends Component {
  state = { recipient: '', amount: 0 };

  updateRecipient = event => {
    this.setState({ recipient: event.target.value });
  };

  updateAmount = event => {
    //by default, event.target.value is stored as string
    this.setState({ amount: Number(event.target.value) });
  };

  ConductTransaction = () => {
    const { recipient, amount } = this.state;
    fetch('http://localhost:3000/api/transact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient, amount }),
    })
      .then(response => response.json())
      .then(json => {
        new Toast(json.message || json.type, Toast.TYPE_MESSAGE, 2000);
        this.props.history.push('/transaction-pool');
      });
  };

  render() {
    return (
      <div className="ConductTransaction">
        <Link className="link" to="/">
          Home
        </Link>
        <h3>Conduct a Transaction</h3>
        <hr className="light" />
        {/* One formgroup for Recipient and one for amount*/}
        <FormGroup>
          <FormControl
            input="text"
            placeholder="Recipient-address"
            value={this.state.recipient}
            onChange={this.updateRecipient}
          />
        </FormGroup>
        <FormGroup>
          <FormControl
            input="number"
            placeholder="amount"
            value={this.state.amount}
            onChange={this.updateAmount}
          />
        </FormGroup>
        <div>
          <Button variant="danger" onClick={this.ConductTransaction}>
            Submit
          </Button>
        </div>
      </div>
    );
  }
}

export default ConductTransaction;
