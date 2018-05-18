const KafkaProducer = require('../src/node-kafka-producer').KafkaProducer;

const configs = {
  kafkaHost: 'localhost:19092,localhost:29092,localhost:39092',
};

const producer = new KafkaProducer({ configs, topic: 'TestTopic' });

let i = 0;
function sendMsg() {
  producer.send(`test${i}`).then((msg) => { console.info(`Sent: ${JSON.stringify(msg)}`); }).catch(err => console.error(`producer err: ${err}`));
  i += 1;
}
setInterval(sendMsg, 1000);
