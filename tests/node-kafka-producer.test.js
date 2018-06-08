jest.mock('node-rdkafka');
jest.mock('uuid');
const KafkaProducer = require('../src/node-kafka-producer').KafkaProducer;

const msg = 'test';
const topic = 'TestTopic';

describe('Kafka Prducer Configs Validation', () => {
  it('should throw error when kafka host is missing', (done) => {
    expect(() => {
      new KafkaProducer({ configs: {}, topic });
    }).toThrow('kafkaHost');
    done();
  });

  it('should throw error when kafka topic is missing', (done) => {
    expect(() => {
      new KafkaProducer({ configs: { kafkaHost: 'localhost:9092' } });
    }).toThrow('topic');
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
    const producer = new KafkaProducer({ configs, topic });
    expect(producer.client.configs).toEqual(fullConfigs);
    expect(producer.producer.client).toBe(producer.client);
    done();
  });

  it('should produce when ready', (done) => {
    const producer = new KafkaProducer({ configs, topic });
    producer.send(msg).then(() => {
      expect(producer.producer.send.mock.calls[0][0]).toEqual([{
        topic,
        messages: [msg],
        message: msg
      }]);
      done();
    });
    producer.producer.emit('ready');
  });

  it('should produce when ready', (done) => {
    const producer = new KafkaProducer({ configs, topic });
    producer.producer.emit('ready');
    producer.send(msg).then(() => {
      expect(producer.producer.send.mock.calls[0][0]).toEqual([{
        topic,
        messages: [msg],
        message: msg
      }]);
      done();
    });
  });

  it('should reject promise on error', (done) => {
    const producer = new KafkaProducer({ configs, topic });
    producer.producer.emit('ready');
    producer.producer.send = jest.fn().mockImplementation((payload, cb) => {
      cb(new Error('some error'));
    });
    producer.send(msg).catch((err) => {
      expect(err).toEqual(new Error('some error'));
      done();
    });
  });
});
