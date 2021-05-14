// to make multiple running processes to communicate over Channels
const redis = require('redis');
const CHANNELS = {
  TEST: 'TEST',
  BLOCKCHAIN: 'BLOCKCHAIN',
};

class PubSub {
  constructor(blockchain) {
    this.blockchain = blockchain;
    this.publisher = redis.createClient();
    this.subscriber = redis.createClient();

    // here, the subscriber will be subscribed to the TEST channel
    this.subscribeToChannels();

    // here the subscriber will actually handle incoming messages -> like a listener function
    this.subscriber.on('message', (channel, message) =>
      this.handleMessage(channel, message)
    );
  }

  handleMessage(channel, message) {
    console.log(`Message received. Channel: ${channel}. Message: ${message}.`);
    const parsedMessage = JSON.parse(message);
    if (channel === CHANNELS.BLOCKCHAIN) {
      this.blockchain.replaceChain(parsedMessage);
    }
  }

  subscribeToChannels() {
    Object.values(CHANNELS).forEach((channel) => {
      this.subscriber.subscribe(channel);
    });
  }

  publish({ channel, message }) {
    // just a wrapper so that doesn't depend on the order of parameters

    // 3 step process is used below to avoid sending the publish msg to itself, so temporarily unsubscribing from the channel, sending the msg, then resubs.
    this.subscriber.unsubscribe(channel, () => {
      this.publisher.publish(channel, message, () => {
        this.publisher.subscribe(channel);
      });
    });
  }

  broadcastChain() {
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain.chain), // as only strings can be used as a message
    });
  }
}

// const testPubSub = new PubSub();

// Different from subscribing functions, this one is used to publish something on the CHANNEL, at the same time, all those instances which are connected to the same channel will receive the 'foo' once this file is loaded - node pubsub.js
// Also, since the subscribing function is also in the same file so this itself will also receive the 'foo' message.

// setTimeout(() => testPubSub.publisher.publish(CHANNELS.TEST, 'foo'), 1000);

// here setTimeout() is used since the subscribing functions defined above are async, so it may happen that the 'publishing' is done before those functions are registered.

module.exports = PubSub;
