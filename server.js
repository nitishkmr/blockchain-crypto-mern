// Each run server will act like a root and a formation of new blockchain
// Wallet, Blockchain etc all will be init here
// Also, for the whole app -> recipient === recipientKey
const express = require('express');
const request = require('request');
const Blockchain = require('./blockchain');
const PubSub = require('./app/pubsub');
const TransactionPool = require('./wallet/transaction-pool');
const Wallet = require('./wallet');
const TransactionMiner = require('./app/transaction-miner');

const isDevelopment = process.env.ENV === 'development';
const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

const app = express();
const blockchain = new Blockchain();
const wallet = new Wallet();
const transactionPool = new TransactionPool();
const pubsub = new PubSub({ blockchain, transactionPool, wallet });
const transactionMiner = new TransactionMiner({ blockchain, transactionPool, wallet, pubsub });
app.use(express.json());
app.use(express.static(__dirname + '/client/dist')); // to also send other files like js scripts also to the frontend, or else only the index.html would've been served

// @desc Fetch the chain
// @route GET/api/blocks
// @access Public(no token req)
app.get('/api/blocks', (req, res) => {
  res.json(blockchain.chain);
});

// @desc Mine a new general block
// @route POST/api/mine
// @access Public(no token req)
app.post('/api/mine', (req, res) => {
  const { data } = req.body;
  blockchain.addBlock({ data });
  pubsub.broadcastChain(); // to broadcast whenever new block is mined
  res.redirect('/api/blocks');
});

// @desc To carry forward a transaction
// @route POST/api/transact
// @access Public(no token req)
app.post('/api/transact', (req, res) => {
  const { amount, recipient } = req.body;

  try {
    let transaction = transactionPool.existingTransaction({
      inputAddress: wallet.publicKey,
    });

    if (transaction) {
      // just update, if already a transaction from the sender is in the pool.
      transaction.update({ senderWallet: wallet, recipientKey: recipient, amount }); // for the whole app, recipientKey===recipient
    } else {
      transaction = wallet.createTransaction({ recipient, amount, chain: blockchain.chain });
    }
    transactionPool.setTransaction(transaction);
    pubsub.broadcastTransaction(transaction); // to broadcast whenever new transaction is done/updated
    res.json({ type: 'success', transaction });
  } catch (err) {
    return res.status(400).json({ type: 'error', message: err.message });
  }
});

// @desc To get the transactionMap from transaction pool
// @route GET/api/transaction-pool-map
// @access Public(no token req)
app.get('/api/transaction-pool-map', (req, res) => {
  res.json(transactionPool.transactionMap);
});

// @desc To add a block with transactions to the blockchain
// @route GET/api/transaction-pool-map
// @access Public(no token req)
app.get('/api/mine-transactions', (req, res) => {
  transactionMiner.mineTransactions();
  res.redirect('/api/blocks');
});

// @desc To get the public address and the wallet's balance
// @route GET/api/transaction-pool-map
// @access Public(no token req)
app.get('/api/wallet-info', (req, res) => {
  const address = wallet.publicKey;

  res.json({
    address,
    balance: Wallet.calculateBalance({ chain: blockchain.chain, address }),
  });
});

// @desc To serve any endpoints other than the above ones
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/client/dist/index.html');
});

// to check if there's already an existing chain then this function will be used to sync with it.
// Eg. first npm run dev (root node) is done -> some blocks are mined -> npm run dev-peer is run, then at root node, chain will already be there.
const syncWithRootState = () => {
  request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` } /*GET req*/, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const rootChain = JSON.parse(body); // body contains stringified data

      console.log('replace chain on a sync with', rootChain);
      blockchain.replaceChain(rootChain);
    }
  });
  request({ url: `${ROOT_NODE_ADDRESS}/api/transaction-pool-map` }, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const rootTransactionPoolMap = JSON.parse(body);

      console.log('replace transaction pool map on a sync with', rootTransactionPoolMap);
      transactionPool.setMap(rootTransactionPoolMap);
    }
  });
};

// SEEDING INITIAL DATA
// if (isDevelopment) {
const walletFoo = new Wallet();
const walletBar = new Wallet();
const generateWalletTransaction = ({ wallet, recipient, amount }) => {
  const transaction = wallet.createTransaction({ recipient, amount, chain: blockchain.chain });

  transactionPool.setTransaction(transaction);
};

// tx from the root wallet to fooWallet
const walletAction = () => generateWalletTransaction({ wallet, recipient: walletFoo.publicKey, amount: 5 });

// tx from fooWallet to barWallet
const walletFooAction = () =>
  generateWalletTransaction({ wallet: walletFoo, recipient: walletBar.publicKey, amount: 10 });

// tx from barWallet to root wallet
const walletBarAction = () =>
  generateWalletTransaction({ wallet: walletBar, recipient: wallet.publicKey, amount: 50 });

for (let i = 0; i < 10; i++) {
  if (i % 3 === 0) {
    walletAction();
    walletFooAction();
  } else if (i % 3 === 1) {
    walletAction();
    walletBarAction();
  } else {
    walletFooAction();
    walletBarAction();
  }
  transactionMiner.mineTransactions();
}
// }

// here multiple ports are needed to different blockchain servers/channels can be run simultaneously
let PEER_PORT;

if (process.env.GENERATE_PEER_PORT === 'true') {
  // will be run if instead of npm run dev, npm run dev-peer is used
  // PEER_PORT = 3001;
  PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = process.env.PORT || PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);

  if (PORT !== DEFAULT_PORT) {
    syncWithRootState();
  }
});
