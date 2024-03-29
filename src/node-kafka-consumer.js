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
    _.defaults(this.configs, { asyncPush: true });
    _.defaults(this.configs, { fromOffset: 'latest' });
    _.defaults(this.configs, { outOfRangeOffset: 'latest' });
    _.defaults(this.configs, { fetchMaxBytes: 1024 * 1024 });
    _.defaults(this.configs, { updateMetadata: 90 * 1000 });
  }

  validateConfigs() {
    const expectedConfigs = ['kafkaHost', 'groupId'];
    const missingConfigs = _.filter(expectedConfigs, (expectedConf) => !Object
      .prototype
      .hasOwnProperty
      .call(this.configs, expectedConf));
    if (missingConfigs.length > 0) {
      throw new Error(`Missing Consumer Configs ${missingConfigs}`);
    }
    if (typeof this.handleMessageFn !== 'function') {
      throw new Error('HandleMessageFn must be a function');
    }
    if (this.topics && this.topics.constructor !== Array) {
      throw new Error('Topics must be an array');
    }
  }

  init() {
    if (typeof (this.consumer) !== 'undefined') {
      logger.info('Kafka consumer had already been initialized. Skipping.');
      return;
    }

    this.consumer = new kafka.ConsumerGroupStream(this.configs, this.topics);
    this.consumer.on('error', (err) => {
      logger.error('node-kafka error:', err);
    });

    this.consumer.on('data', (msg) => {
      this.handleMessageFn(msg).then(() => {
        this.consumer.commit(msg, true);
      }).catch((err) => {
        logger.error('Message not committed. Consumer error on handleMessageFn:', err);
      });
    });

    setInterval(this.refreshMetadata.bind(this), this.configs.updateMetadata);
    logger.info('ConsumerGroupStream started');
  }

  onError(handler) {
    this.consumer.on('error', handler);
  }

  refreshMetadata() {
    this.consumer.consumerGroup.client.refreshMetadata(
      this.consumer.consumerGroup.topics,
      (err) => {
        if (err) {
          logger.warn('Refresh metadata error:', err);
          if (err.name === 'BrokerNotAvailableError') {
            this.consumer.close(() => {
              process.exit(1);
            });
          }
        }
      }
    );
  }
}

module.exports = { KafkaConsumer };
