# Node Kafka
[![Build Status](https://travis-ci.org/quintoandar/node-kafka.svg?branch=master)](https://travis-ci.org/quintoandar/node-kafka)

[![NPM](https://nodei.co/npm/quintoandar-kafka.png)](https://nodei.co/npm/quintoandar-kafka/)
<!--[![NPM](https://nodei.co/npm-dl/quintoandar-kafka.png?height=3)](https://nodei.co/npm/quintoandar-kafka/)-->

Standard node consumer/producer implementation for QuintoAndar.

## Consumer Caracteristics

- Commits offset to Kafka after message is processed.
  - Node processes messages asynchronously, so there is no guarantee that messages with errors will be reprocessed. This should be done at aplication level.
- Has an optional custom implementation to make message processing idempotent.
- Is resilient to cluster node failures.
- The handleMessageFn is exepected to return a promisse. The promisse should be resolved after the message is processed, this will trigger the offset commit in Kafka.

## Examples

See [exemples folder](/example)

## Configuration

Checkout [kafka-node repo](https://github.com/SOHU-Co/kafka-node) for configuration info.