jest.mock('node-rdkafka');
jest.mock('uuid');
const KafkaProducer = require('../src/producer').KafkaProducer;

const msg = 'test';
const uuid = 'a1';
const topic = 'TestTopic'
jest.mock('uuid/v4', () => jest.fn().mockImplementation(() => 'a1'));

describe('Kafka Prducer Configs Validation', () => {
  it('should throw error when kafka host is missing', (done) => {
    expect(() => {
      new KafkaProducer({ configs: {}, topic });
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
    dr_cb: true,
  };

  it('should configure corretly kafka lib', (done) => {
    const producer = new KafkaProducer({ configs, topic });
    expect(producer.producer.connect).toBeCalled();
    expect(producer.configs).toEqual(fullConfigs);
    done();
  });

  it('should produce when ready', (done) => {
    const producer = new KafkaProducer({ configs, topic });
    producer.send(msg).then(() => {
      expect(producer.producer.produce).toBeCalledWith(
        topic,
        null,
        Buffer.from(msg),
        undefined,
        undefined,
        uuid,
      );
      done();
    });
    producer.producer.emit('ready');
    producer.producer.emit('delivery-report', null, { opaque: uuid });
  });

  it('should produce if already ready', (done) => {
    const producer = new KafkaProducer({ configs, topic });
    producer.producer.emit('ready');
    producer.init();
    producer.send(msg).then(() => {
      expect(producer.producer.produce).toBeCalledWith(
        topic,
        null,
        Buffer.from(msg),
        undefined,
        undefined,
        uuid,
      );
      expect(producer.ready).toBeTruthy();
      done();
    });
    producer.producer.emit('delivery-report', null, { opaque: uuid });
  });

  it('should reject promise on error', (done) => {
    const producer = new KafkaProducer({ configs, topic });
    producer.producer.emit('ready');
    producer.producer.produce = jest.fn().mockImplementation(() => {
      throw new Error('some error');
    });
    producer.send(msg).catch((err) => {
      expect(err).toEqual(new Error('some error'));
      done();
    });
  });

  it('should reject promise on delivery error', (done) => {
    const producer = new KafkaProducer({ configs, topic });
    producer.producer.emit('ready');
    producer.send(msg).catch((err) => {
      expect(err).toEqual(new Error('some error'));
      done();
    });
    producer.producer.emit('delivery-report', new Error('some error'), { opaque: uuid });
  });
});
