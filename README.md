# Node Kafka

Standard node consumer/producer implementation for QuintoAndar.

## Install

## Use

## Consumer Caracteristics

- Commits offset to Kafka after message is processed.
  - Node processes messages asynchronously, so there is no guarantee that messages with errors will be reprocessed. This should be done at aplication level.
- Has an optional custom implementation to make message processing idempotent.
- Is resilient to cluster node failures.

## Configuration

Checkout (node-kafka repo)[https://github.com/SOHU-Co/kafka-node] for configuration info.