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