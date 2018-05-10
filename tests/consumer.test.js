jest.mock('node-rdkafka');
const KafkaConsumer = require('../src/consumer').KafkaConsumer;

describe('Kafka Consumer Configs Validation', () => {
  it('should throw error when consumer group is missing', (done) => {
    expect(() => {
      new KafkaConsumer({ configs: { 'metadata.broker.list': 'localhost:9092' }, topics: [], handleMessageFn: () => { } });
    }).toThrow('group.id');
    done();
  });

  it('should throw error when kafka host is missing', (done) => {
    expect(() => {
      new KafkaConsumer({ configs: { 'group.id': 'test' }, topics: [], handleMessageFn: () => { } });
    }).toThrow('metadata.broker.list');
    done();
  });

  it('should throw error when topics is not an array', (done) => {
    expect(() => {
      new KafkaConsumer({
        configs: {
          'metadata.broker.list': 'localhost:9092', 'group.id': 'test',
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
          'metadata.broker.list': 'localhost:9092', 'group.id': 'test',
        },
        topics: []
      });
    }).toThrow('HandleMessageFn');
    done();
  });
});


describe('Kafka Consumer', () => {
  const handleMessageFn = jest.fn().mockImplementation(() => {
    return new Promise((resolve) => {
      resolve();
    });
  });

  const configs = {
    'metadata.broker.list': 'localhost:9092',
    'group.id': 'test'
  };

  const fullConfigs = {
    'metadata.broker.list': 'localhost:9092',
    'group.id': 'test',
    'session.timeout.ms': 15000,
    'auto.offset.reset': 'latest',
    'log.connection.close': false,
  };

  const topics = ['Test'];

  it('should configure corretly kafka lib', (done) => {
    const consumer = new KafkaConsumer({ configs, topics, handleMessageFn });
    consumer.init();
    expect(consumer.configs).toEqual(fullConfigs);
    expect(consumer.topics).toEqual(topics);
    expect(consumer.consumer.connect).toHaveBeenCalled();
    done();
  });

  it('should call handle function on new message', (done) => {
    const consumer = new KafkaConsumer({ configs, topics, handleMessageFn });
    consumer.init();
    consumer.consumer.emit('data', 'Event');
    expect(handleMessageFn).toBeCalledWith('Event');
    done();
  });

  it('should call commit offset after handling new msg', (done) => {
    const consumer = new KafkaConsumer({ configs, topics, handleMessageFn });
    consumer.init();
    consumer.consumer.finishCallback = () => {
      expect(consumer.consumer.commitMessage).toBeCalledWith('Event');
      done();
    };
    consumer.consumer.emit('data', 'Event');
  });

  it('should throw error on error event', (done) => {
    const consumer = new KafkaConsumer({ configs, topics, handleMessageFn });
    global.process.exit = jest.fn();
    consumer.init();
    consumer.consumer.emit('error', 'error');
    expect(global.process.exit).toHaveBeenCalledWith(1);
    done();
  });
});
