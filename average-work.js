const Blockchain = require('./blockchain');
const blockchain = new Blockchain();

blockchain.addBlock({ data: 'initial' }); // as Genesis will be there by default but it's timestamp is set to 1 i.e. in 1970

let prevTimestamp, nextTimestamp, nextBlock, timeDiff, average;

const times = [];

// the average rate of mining of blocks should eventually converge to the required MIN_RATE
for (let i = 0; i < 10000; i++) {
  prevTimestamp = blockchain.chain[blockchain.chain.length - 1].timestamp;
  blockchain.addBlock({ data: `block ${i}` });
  newBlock = blockchain.chain[blockchain.chain.length - 1];
  newTimestamp = newBlock.timestamp;

  timeDiff = newTimestamp - prevTimestamp;
  times.push(timeDiff);

  average = times.reduce((total, num) => total + num) / times.length;
  console.log(
    `Time to mine block: ${timeDiff}ms. Difficulty: ${newBlock.difficulty}. Average time: ${average}ms`
  );
}
