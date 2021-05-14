const express = require('express');
const request = require('request');
const Blockchain = require('./blockchain');
const PubSub = require('./pubsub');

const app = express();
const blockchain = new Blockchain();
const pubSub = new PubSub(blockchain);
app.use(express.json());

const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

setTimeout(() => pubSub.broadcastChain(), 1000); // will publish on a channel

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
  pubSub.broadcastChain(); // to broadcase whenever new block is mined
  res.redirect('/api/blocks');
});

// to check if there's already an existing chain then this function will be used to sync with it.
// Eg. first npm run dev (root node) is done -> some blocks are mined -> npm run dev-peer is run, then at root node, chain will already be there.
const syncChains = () => {
  request(
    { url: `${ROOT_NODE_ADDRESS}/api/blocks` } /*GET req*/,
    (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const rootChain = JSON.parse(body); // body contains stringified data

        console.log('replace chain on a sync with', rootChain);
        blockchain.replaceChain(rootChain);
      }
    }
  );
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
  syncChains();
});
