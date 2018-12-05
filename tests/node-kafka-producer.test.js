jest.mock('node-rdkafka');
jest.mock('uuid');
const KafkaProducer = require('../src/node-kafka-producer').KafkaProducer;

const topic = 'TestTopic';

describe('Kafka Prducer Configs Validation', () => {
  it('should throw error when kafka host is missing', (done) => {
    expect(() => {
      new KafkaProducer({ configs: {}, topic });
    }).toThrow('kafkaHost');
    done();
  });
});

describe('Kafka Producer', () => {
  const configs = {
    kafkaHost: 'localhost:9092',
  };

  const fullConfigs = {
    kafkaHost: 'localhost:9092',
  };

  it('should configure corretly kafka lib', (done) => {
    const producer = new KafkaProducer({ configs });
    expect(producer.client.configs).toEqual(fullConfigs);
    expect(producer.producer.client).toBe(producer.client);
    done();
  });

  describe('send', () => {
    const msg = 'test';
    const batchMsgs = ['test1', 'test2'];

    it('should produce when ready', (done) => {
      const producer = new KafkaProducer({ configs });
      producer.send(topic, msg).then(() => {
        expect(producer.producer.send.mock.calls[0][0]).toEqual([{
          topic,
          messages: [msg],
        }]);
        done();
      });
      producer.producer.emit('ready');
    });
    it('should produce when ready', (done) => {
      const producer = new KafkaProducer({ configs });
      producer.producer.emit('ready');
      producer.send(topic, msg).then(() => {
        expect(producer.producer.send.mock.calls[0][0]).toEqual([{
          topic,
          messages: [msg],
        }]);
        done();
      });
    });
    it('should reject promise on error', (done) => {
      const producer = new KafkaProducer({ configs });
      producer.producer.emit('ready');
      producer.producer.send = jest.fn().mockImplementation((payload, cb) => {
        cb(new Error('some error'));
      });
      producer.send(topic, msg).catch((err) => {
        expect(err).toEqual(new Error('some error'));
        done();
      });
    });
    it('with array of messages, should produce when ready', (done) => {
      const producer = new KafkaProducer({ configs });
      producer.send(topic, batchMsgs).then(() => {
        expect(producer.producer.send.mock.calls[0][0]).toEqual([{
          topic,
          messages: batchMsgs,
        }]);
        done();
      });
      producer.producer.emit('ready');
    });
    it('with array of messages, should produce when ready', (done) => {
      const producer = new KafkaProducer({ configs });
      producer.producer.emit('ready');
      producer.send(topic, batchMsgs).then(() => {
        expect(producer.producer.send.mock.calls[0][0]).toEqual([{
          topic,
          messages: batchMsgs,
        }]);
        done();
      });
    });
    it('with array of messages, should reject promise on error', (done) => {
      const producer = new KafkaProducer({ configs });
      producer.producer.emit('ready');
      producer.producer.send = jest.fn().mockImplementation((payload, cb) => {
        cb(new Error('some error'));
      });
      producer.send(topic, batchMsgs).catch((err) => {
        expect(err).toEqual(new Error('some error'));
        done();
      });
    });
  });
});
