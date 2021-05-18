import React, { Component } from 'react';

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
      <div>
        <div>Welcome to the Blockchain!</div>
        <div>Address: {address}</div>
        <div>Balance: {balance}</div>
      </div>
    );
  }
}

export default App;
