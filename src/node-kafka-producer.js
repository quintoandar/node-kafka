const kafka = require('kafka-node');
const logger = require('quintoandar-logger').getLogger(module);
const _ = require('lodash');

class KafkaProducer {
  constructor({ configs }) {
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
  }

  init() {
    this.client = new kafka.KafkaClient(this.configs);
    this.producer = new kafka.HighLevelProducer(this.client);
    this.producer.on('error', logger.error);
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

  send(topic, msg) {
    const sendPromisse = new Promise((resolve, reject) => {
      const payload = { topic, messages: [msg] };
      this.readyPromisse.then(() => {
        this.producer.send([payload], (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    });
    return sendPromisse;
  }

  sendBatch(topic, msg) {
    if (!Array.isArray(msg)) {
      throw new Error('For sendBatch the second parameter should be an array of messages');
    }
    const sendPromisse = new Promise((resolve, reject) => {
      const payload = { topic, messages: msg };
      this.readyPromisse.then(() => {
        this.producer.send([payload], (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    });
    return sendPromisse;
  }
}

module.exports = { KafkaProducer };
