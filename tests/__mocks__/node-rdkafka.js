const EventEmitter = require('events').EventEmitter;

class KafkaConsumer extends EventEmitter {
  constructor(configs, topics) {
    super();
    this.configs = configs;
    this.topics = topics;
    this.commitMessage = jest.fn().mockImplementation(() => {
      this.finishCallback();
    });
    this.connect = jest.fn();
  }
}

class Producer extends EventEmitter {
  constructor(configs) {
    super();
    this.configs = configs;
    this.produce = jest.fn();
    this.connect = jest.fn();
  }
}

module.exports = { KafkaConsumer, Producer };
