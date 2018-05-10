const kafka = require('node-rdkafka');
const logger = require('quintoandar-logger').getLogger(module);
const _ = require('lodash');

class KafkaConsumer {
  constructor({ configs, topics, handleMessageFn }) {
    this.configs = configs;
    this.topics = topics;
    this.handleMessageFn = handleMessageFn;
    this.configs['log.connection.close'] = false;
    this.validateConfigs();
    _.defaults(this.configs, { 'session.timeout.ms': 15000 });
    _.defaults(this.configs, { 'auto.offset.reset': 'latest' });
  }

  validateConfigs() {
    const expectedConfigs = ['metadata.broker.list', 'group.id'];
    const missingConfigs = _.filter(expectedConfigs, expectedConf =>
      !Object.prototype.hasOwnProperty.call(this.configs, expectedConf));
    if (missingConfigs.length > 0) {
      throw new Error(`Missing Consumer Configs ${missingConfigs}`);
    }
    if (typeof this.handleMessageFn !== 'function') {
      throw new Error('HandleMessageFn must be a fucntion');
    }
    if (this.topics && this.topics.constructor !== Array) {
      throw new Error('Topics must be an array');
    }
  }

  init() {
    this.consumer = new kafka.KafkaConsumer(this.configs, this.topics);

    this.consumer.connect();
    this.consumer.on('ready', () => {
      this.consumer.subscribe(this.topics);
      this.consumer.consume();
      logger.info('Consumer started');
    });

    this.consumer.on('error', (error) => {
      logger.error('Kafka Consumer Error', error);
      process.exit(1);
    });

    this.consumer.on('data', (msg) => {
      this.handleMessageFn(msg).then(() => {
        this.consumer.commitMessage(msg);
      });
    });
  }
}

module.exports = { KafkaConsumer };
