jest.mock('kafka-node');
const KafkaConsumer = require('../src/node-kafka-consumer').KafkaConsumer;

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

function handleMessageMock(done) {
  return jest.fn().mockImplementation(() =>
    new Promise((resolve) => {
      resolve();
      if (done) {
        done();
      }
    }));
}

describe('Kafka Consumer', () => {
  const configs = {
    kafkaHost: 'localhost:9092',
    groupId: 'test'
  };

  const fullConfigs = {
    kafkaHost: 'localhost:9092',
    groupId: 'test',
    autoCommit: false,
    sessionTimeout: 15000,
    protocol: ['roundrobin'],
    asyncPush: false,
    fromOffset: 'latest',
    outOfRangeOffset: 'latest',
    fetchMaxBytes: 1024 * 1024
  };

  const topics = ['Test'];

  it('should configure corretly kafka-node lib', (done) => {
    const handleMessageFn = handleMessageMock(done);
    const consumer = new KafkaConsumer({ configs, topics, handleMessageFn });
    consumer.init();
    expect(consumer.configs).toEqual(fullConfigs);
    expect(consumer.topics).toEqual(topics);
    done();
  });

  it('should call handle function on new message', (done) => {
    const handleMessageFn = handleMessageMock(done);
    const consumer = new KafkaConsumer({ configs, topics, handleMessageFn });
    consumer.init();
    consumer.consumer.emit('data', 'Event');
    expect(handleMessageFn).toBeCalledWith('Event');
  });

  it('should call commit offset after handling new msg', (done) => {
    const handleMessageFn = handleMessageMock();
    const consumer = new KafkaConsumer({ configs, topics, handleMessageFn });
    consumer.init();
    consumer.consumer.finishCallback = () => {
      expect(consumer.consumer.commit).toBeCalledWith('Event', true);
      done();
    };
    consumer.consumer.emit('data', 'Event');
  });

  it('should throw error on error event', (done) => {
    const handleMessageFn = handleMessageMock(done);
    const consumer = new KafkaConsumer({ configs, topics, handleMessageFn });
    global.process.exit = jest.fn();
    consumer.init();
    consumer.consumer.emit('error', 'error');
    expect(global.process.exit).toHaveBeenCalledWith(1);
    done();
  });
});
