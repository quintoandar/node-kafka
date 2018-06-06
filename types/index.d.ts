import { Writable } from 'stream';
import { ConsumerGroupOptions, KafkaClientOptions, HighLevelConsumerOptions } from 'kafka-node';

export { ConsumerGroupOptions, KafkaClientOptions, HighLevelConsumerOptions } from 'kafka-node';

export interface KafkaConsumerOptions {
    configs: ConsumerGroupOptions;
    topics: string[] | string;
    handleMessageFn: (message: any) => any;
}
export class KafkaConsumer {
    constructor(options: KafkaConsumerOptions);

    init(): void
}