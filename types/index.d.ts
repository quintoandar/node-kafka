import { Writable } from 'stream';
import { ConsumerGroupOptions, KafkaClientOptions } from 'kafka-node';

export { ConsumerGroupOptions, KafkaClientOptions } from 'kafka-node';

export interface KafkaConsumerOptions {
    configs: ConsumerGroupOptions;
    topics: string[] | string;
    handleMessageFn: (message: any) => any;
}
export class KafkaConsumer {
    constructor(options: KafkaConsumerOptions);

    init(): void
}

export class KafkaProducerOptions {
    configs: KafkaClientOptions;
    topic: string;
}

export class KafkaProducer {
    constructor(options: KafkaProducerOptions)

    send(msg: string): Promise<string>;
}