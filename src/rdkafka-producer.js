const kafka = require('node-rdkafka');
const logger = require('quintoandar-logger').getLogger(module);
const _ = require('lodash');
const uuidv4 = require('uuid/v4');

class KafkaProducer {
  constructor({ configs, topic }) {
    this.sentPromisses = {};
    this.topic = topic;
    this.configs = configs;
    this.configs.dr_cb = true;
    this.ready = false;
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
    this.producer = new kafka.Producer(this.configs, { 'request.required.acks': 1 });
    this.producer.connect();
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
    this.producer.on('error', (err) => {
      logger.error(err);
    });
    this.producer.on('delivery-report', (err, report) => {
      logger.debug(report);
      const promise = this.sentPromisses[report.opaque];
      delete this.sentPromisses[report.opaque];
      if (err) {
        promise.reject(err);
      }
      promise.resolve(promise.msg);
    });
    this.producer.on('event.log', logger.info);
  }

  send(msg) {
    const uuid = uuidv4();
    const sendPromisse = new Promise((resolve, reject) => {
      this.sentPromisses[uuid] = { resolve, reject, msg };
      this.readyPromisse.then(() => {
        try {
          this.producer.produce(this.topic, null, Buffer.from(msg), undefined, undefined, uuid);
          setImmediate(() => {
            this.producer.poll();
          });
        } catch (e) {
          delete this.sentPromisses[uuid];
          reject(e);
        }
      });
    });
    return sendPromisse;
  }
}

module.exports = { KafkaProducer };
