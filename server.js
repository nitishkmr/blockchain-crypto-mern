const express = require('express');
const Blockchain = require('./blockchain');
const PubSub = require('./pubsub');

const app = express();
const blockchain = new Blockchain();
const pubSub = new PubSub(blockchain);
app.use(express.json());

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
  res.redirect('/api/blocks');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
