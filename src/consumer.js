const kafka = require('kafka-node');
const logger = require('quintoandar-logger').getLogger(module);
const _ = require('lodash');

class KafkaConsumer {
  constructor({ configs, topics, handleMessageFn }) {
    this.configs = configs;
    this.topics = topics;
    this.handleMessageFn = handleMessageFn;
    this.validateConfigs();
    this.configs.autoCommit = false;
    _.defaults(this.configs, { sessionTimeout: 15000 });
    _.defaults(this.configs, { protocol: ['roundrobin'] });
    _.defaults(this.configs, { asyncPush: false });
    _.defaults(this.configs, { fromOffset: 'latest' });
    _.defaults(this.configs, { outOfRangeOffset: 'latest' });
    _.defaults(this.configs, { fetchMaxBytes: 1024 * 1024 });
  }

  validateConfigs() {
    const expectedConfigs = ['kafkaHost', 'groupId'];
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
    this.consumer = new kafka.ConsumerGroupStream(this.configs, this.topics);

    this.consumer.on('error', (err) => {
      logger.error(err);
      process.exit(1);
    });

    this.consumer.on('LeaderNotAvailable', () => {
      logger.error('LeaderNotAvailable');
    });

    this.consumer.on('data', (msg) => {
      this.handleMessageFn(msg).then(() => {
        this.consumer.commit(msg, true);
      });
    });
    logger.info('ConsumerGroupStream started');
  }
}

module.exports = { KafkaConsumer };
