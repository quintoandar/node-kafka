const kafka = require('node-rdkafka');
const logger = require('quintoandar-logger').getLogger(module);
const _ = require('lodash');

class KafkaProducer {
  constructor({ configs, topic }) {
    this.topic = topic;
    this.configs = configs;
    this.validateConfigs();
    _.defaults(this.configs, { 'log.connection.close': false });
    this.init();
  }

  validateConfigs() {
    const expectedConfigs = ['metadata.broker.list'];
    const missingConfigs = _.filter(expectedConfigs, expectedConf =>
      !Object.prototype.hasOwnProperty.call(this.configs, expectedConf));
    if (missingConfigs.length > 0) {
      throw new Error(`Missing Producer Configs ${missingConfigs}`);
    }
    if (!this.topic) {
      throw new Error('Missing param: topic');
    }
  }

  init() {
    this.producer = kafka.Producer.createWriteStream(this.configs, {}, { topic: this.topic });
    this.producer.on('error', (err) => {
      logger.error(err);
    });
  }

  send(msg) {
    const queued = this.producer.write(Buffer.from(msg));
    if (!queued) {
      throw new Error('Too many messages in queue');
    }
  }
}

module.exports = { KafkaProducer };
