const KafkaProducer = require('../src/producer').KafkaProducer;

const configs = {
  'metadata.broker.list': 'localhost:19092,localhost:29092,localhost:39092',
  'group.id': 'test1',
};

const producer = new KafkaProducer({ configs, topic: 'TestTopic' });

let i = 0;
function sendMsg() {
  producer.send(`test${i}`).then((msg) => { console.info(`Sent: ${msg}`); }).catch(err => console.error(`producer err: ${err}`));
  i += 1;
}
setInterval(sendMsg, 1000);
