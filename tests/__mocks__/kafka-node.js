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

module.exports = { ConsumerGroupStream };
