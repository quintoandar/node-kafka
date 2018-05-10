const KafkaConsumer = require('../src/consumer').KafkaConsumer;

const configs = {
  'metadata.broker.list': 'localhost:19092,localhost:29092,localhost:39092',
  'group.id': 'test1',
};

const topics = ['TestTopic'];

function handleMessageFn(msg) {
  return new Promise((resolve) => {
    console.log(msg);
    resolve();
  });
}

const consumer = new KafkaConsumer({ configs, topics, handleMessageFn });
consumer.init();
