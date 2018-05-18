const KafkaConsumer = require('../src/main').KafkaConsumer;

const configs = {
  kafkaHost: 'localhost:19092,localhost:29092,localhost:39092',
  groupId: 'test',
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
