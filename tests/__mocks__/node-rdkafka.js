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

class KafkaProducer extends EventEmitter {
  constructor(configs) {
    super();
    this.configs = configs;
    this.producer = jest.fn();
    this.write = jest.fn().mockReturnValue(true);
  }
}

const Producer = {
  createWriteStream(configs, topic) {
    return new KafkaProducer({ configs, topic });
  }
};

module.exports = { KafkaConsumer, Producer };
