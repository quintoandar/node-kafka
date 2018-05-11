jest.mock('node-rdkafka');
const KafkaProducer = require('../src/producer').KafkaProducer;

describe('Kafka Prducer Configs Validation', () => {
  it('should throw error when kafka host is missing', (done) => {
    expect(() => {
      new KafkaProducer({ configs: {}, topic: 'TestTopic' });
    }).toThrow('metadata.broker.list');
    done();
  });

  it('should throw error when kafka topic is missing', (done) => {
    expect(() => {
      new KafkaProducer({ configs: { 'metadata.broker.list': 'localhost:9092' } });
    }).toThrow('topic');
    done();
  });
});

describe('Kafka Producer', () => {
  const configs = {
    'metadata.broker.list': 'localhost:9092',
  };

  const fullConfigs = {
    'metadata.broker.list': 'localhost:9092',
    'log.connection.close': false,
  };

  it('should configure corretly kafka lib', (done) => {
    const producer = new KafkaProducer({ configs, topic: 'TestTopic' });
    expect(producer.configs).toEqual(fullConfigs);
    done();
  });

  it('should write to stream on send message', (done) => {
    const producer = new KafkaProducer({ configs, topic: 'TestTopic' });
    producer.send('test');
    expect(producer.producer.write).toBeCalledWith(Buffer.from('test'));
    done();
  });

  it('should throw error if queue is full on write', (done) => {
    const producer = new KafkaProducer({ configs, topic: 'TestTopic' });
    producer.producer.write = jest.fn().mockReturnValue(false);
    expect(() => {
      producer.send('test');
    }).toThrow('Too many messages in queue');
    done();
  });
});
