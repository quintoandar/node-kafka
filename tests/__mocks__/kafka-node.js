const EventEmitter = require('events').EventEmitter;

class ConsumerGroupStream extends EventEmitter {
  constructor(configs, topics) {
    super();
    this.configs = configs;
    this.topics = topics;
    this.commit = jest.fn().mockImplementation(() => {
      this.finishCallback();
    });
  }
}

class HighLevelProducer extends EventEmitter {
  constructor(client, configs) {
    super();
    this.configs = configs;
    this.client = client;
    this.send = jest.fn().mockImplementation((payload, cb) => {
      cb(null, payload[0]);
    });
  }
}

class KafkaClient {
  constructor(configs) {
    this.configs = configs;
  }
}

module.exports = { ConsumerGroupStream, HighLevelProducer, KafkaClient };
