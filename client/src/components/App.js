import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import crypto3 from '../assets/crypto3.png';

class App extends Component {
  state = { walletInfo: {} }; // will get wallet info from the backend

  componentDidMount() {
    fetch('http://localhost:3000/api/wallet-info') // fetch returns a promise
      .then(response => response.json()) // .json() also returns a promise
      .then(json => this.setState({ walletInfo: json }));
  }

  // since render() is dependent on address, balance, so if the state is changed where address, balance are there, a re-render will occur
  render() {
    const { address, balance } = this.state.walletInfo;
    return (
      <div className="App">
        <img className="logo" src={crypto3} />
        <h3>Welcome to the Blockchain!</h3>
        <Link className="link" to="/blocks">
          Blocks
        </Link>
        <Link className="link" to="/conduct-transaction">
          Conduct a Transaction
        </Link>
        <Link className="link" to="/transaction-pool">
          Transaction Pool
        </Link>
        <br />
        <div className="walletInfo">
          <div>My Address: {address}</div>
          <div>My Balance: {balance}</div>
        </div>
      </div>
    );
  }
}

export default App;
