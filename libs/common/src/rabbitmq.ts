import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import {
  CHAIN_EVENTS_EXCHANGE,
  CHAIN_EVENTS_QUEUE_INDEXER,
  CHAIN_EVENTS_QUEUE_NOTIFICATION,
  CHAIN_EVENTS_ROUTING_KEY,
  ChainEventMessage,
} from './types';

@Injectable()
export class RabbitMqService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMqService.name);
  private connection: Awaited<ReturnType<typeof amqp.connect>> | null = null;
  private channel: amqp.Channel | null = null;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    try {
      await this.channel?.close();
      await this.connection?.close();
    } catch {
      // ignore shutdown errors
    }
  }

  private async connect() {
    const url = this.config.get<string>('RABBITMQ_URL', 'amqp://eth:eth@localhost:5672');
    this.connection = await amqp.connect(url);
    this.channel = await this.connection.createChannel();

    await this.channel.assertExchange(CHAIN_EVENTS_EXCHANGE, 'topic', { durable: true });
    await this.channel.assertQueue(CHAIN_EVENTS_QUEUE_INDEXER, { durable: true });
    await this.channel.assertQueue(CHAIN_EVENTS_QUEUE_NOTIFICATION, { durable: true });
    await this.channel.bindQueue(
      CHAIN_EVENTS_QUEUE_INDEXER,
      CHAIN_EVENTS_EXCHANGE,
      CHAIN_EVENTS_ROUTING_KEY,
    );
    await this.channel.bindQueue(
      CHAIN_EVENTS_QUEUE_NOTIFICATION,
      CHAIN_EVENTS_EXCHANGE,
      CHAIN_EVENTS_ROUTING_KEY,
    );

    this.logger.log('RabbitMQ connected and topology ready');
  }

  async publishChainEvent(message: ChainEventMessage) {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not ready');
    }
    this.channel.publish(
      CHAIN_EVENTS_EXCHANGE,
      CHAIN_EVENTS_ROUTING_KEY,
      Buffer.from(JSON.stringify(message)),
      { contentType: 'application/json', persistent: true },
    );
  }

  async consume(queue: string, handler: (msg: ChainEventMessage) => Promise<void>) {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not ready');
    }
    await this.channel.consume(queue, async (raw) => {
      if (!raw || !this.channel) return;
      try {
        const payload = JSON.parse(raw.content.toString()) as ChainEventMessage;
        await handler(payload);
        this.channel.ack(raw);
      } catch (err) {
        this.logger.error(`Failed processing message on ${queue}`, err as Error);
        this.channel.nack(raw, false, false);
      }
    });
    this.logger.log(`Consuming queue ${queue}`);
  }
}
