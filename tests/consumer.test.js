jest.mock('kafka-node');
const KafkaConsumer = require('../src/consumer').KafkaConsumer;

describe('Kafka Consumer Configs Validation', () => {
  it('should throw error when consumer group is missing', (done) => {
    expect(() => {
      new KafkaConsumer({ configs: { kafkaHost: 'localhost:9092' }, topics: [], handleMessageFn: () => { } });
    }).toThrow('groupId');
    done();
  });

  it('should throw error when kafka host is missing', (done) => {
    expect(() => {
      new KafkaConsumer({ configs: { groupId: 'test' }, topics: [], handleMessageFn: () => { } });
    }).toThrow('kafkaHost');
    done();
  });

  it('should throw error when topics is not an array', (done) => {
    expect(() => {
      new KafkaConsumer({
        configs: {
          kafkaHost: 'localhost:9092', groupId: 'test',
        },
        topics: 'test',
        handleMessageFn: () => { }
      });
    }).toThrow('array');
    done();
  });

  it('should throw error when handleMessage function is missing', (done) => {
    expect(() => {
      new KafkaConsumer({
        configs: {
          kafkaHost: 'localhost:9092', groupId: 'test',
        },
        topics: []
      });
    }).toThrow('HandleMessageFn');
    done();
  });
});


describe('Kafka Consumer', () => {
  const handleMessageFn = jest.fn().mockImplementation();
  const configs = {
    kafkaHost: 'localhost:9092', groupId: 'test'
  };

  it('should call handle function on new message', (done) => {
    new KafkaConsumer({ configs, topics: ['Test'], handleMessageFn });
    done();
  });

  it('should exit on error event', (done) => {
    done();
  });

  it('should exit on close event', (done) => {
    done();
  });
});
