// Each run server will act like a root and a formation of new blockchain
// Wallet, Blockchain etc all will be init here
// Also, for the whole app -> recipient === recipientKey
const express = require('express');
const request = require('request');
const Blockchain = require('./blockchain');
const PubSub = require('./app/pubsub');
const TransactionPool = require('./wallet/transaction-pool');
const Wallet = require('./wallet');

const app = express();
const blockchain = new Blockchain();
const wallet = new Wallet();
const transactionPool = new TransactionPool();
const pubSub = new PubSub(blockchain, transactionPool);
app.use(express.json());

const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

// @desc Fetch the chain
// @route GET/api/blocks
// @access Public(no token req)
app.get('/api/blocks', (req, res) => {
  res.json(blockchain.chain);
});

// @desc Mine a new block
// @route POST/api/mine
// @access Public(no token req)
app.post('/api/mine', (req, res) => {
  const { data } = req.body;
  blockchain.addBlock({ data });
  pubSub.broadcastChain(); // to broadcast whenever new block is mined
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
      transaction = wallet.createTransaction({ recipient, amount });
    }
    transactionPool.setTransaction(transaction);
    pubSub.broadcastTransaction(transaction); // to broadcast whenever new transaction is done/updated
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

// here multiple ports are needed to different blockchain servers/channels can be run simultaneously
let PEER_PORT;

if (process.env.GENERATE_PEER_PORT === 'true') {
  // will be run if instead of npm run dev, npm run dev-peer is used
  PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);

  if (PORT !== DEFAULT_PORT) {
    syncWithRootState();
  }
});
