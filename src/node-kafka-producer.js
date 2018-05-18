const kafka = require('kafka-node');
const logger = require('quintoandar-logger').getLogger(module);
const _ = require('lodash');

class KafkaProducer {
  constructor({ configs, topic }) {
    this.topic = topic;
    this.configs = configs;
    this.ready = false;
    this.validateConfigs();
    this.init();
  }

  validateConfigs() {
    const expectedConfigs = ['kafkaHost'];
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
    this.client = new kafka.KafkaClient(this.configs);
    this.producer = new kafka.Producer(this.client, this.configs);
    this.readyPromisse = new Promise((resolve) => {
      if (this.ready) {
        resolve();
      } else {
        this.producer.on('ready', () => {
          this.ready = true;
          resolve();
        });
      }
    });
  }

  send(msg) {
    const sendPromisse = new Promise((resolve, reject) => {
      const payload = { topic: this.topic, messages: [msg] };
      this.readyPromisse.then(() => {
        this.producer.send([payload], (err, data) => {
          logger.debug(data);
          if (err) {
            reject(err);
          } else {
            data.message = msg;
            resolve(data);
          }
        });
      });
    });
    return sendPromisse;
  }
}

module.exports = { KafkaProducer };
