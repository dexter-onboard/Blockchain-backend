import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Contract, JsonRpcProvider, WebSocketProvider } from 'ethers';
import {
  SIMPLE_REGISTRY_ABI,
  RabbitMqService,
  ChainEventMessage,
} from '../../../libs/common/src';

@Injectable()
export class EventListenerService implements OnModuleInit {
  private readonly logger = new Logger(EventListenerService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly rabbit: RabbitMqService,
  ) {}

  async onModuleInit() {
    const rpcUrl = this.config.get<string>('ALCHEMY_RPC_URL', 'http://127.0.0.1:8545');
    const wsUrl = this.config.get<string>('ALCHEMY_WS_URL');
    const address = this.config.get<string>('CONTRACT_ADDRESS');

    if (!address) {
      this.logger.warn('CONTRACT_ADDRESS not set — listener idle');
      return;
    }

    const provider = wsUrl?.startsWith('ws')
      ? new WebSocketProvider(wsUrl)
      : new JsonRpcProvider(rpcUrl);

    const contract = new Contract(address, SIMPLE_REGISTRY_ABI, provider);

    contract.on('ValueSet', async (account, value, entryId, timestamp, event) => {
      const log = event.log ?? event;
      const message: ChainEventMessage = {
        txHash: log.transactionHash,
        logIndex: Number(log.index ?? log.logIndex ?? 0),
        blockNumber: String(log.blockNumber),
        contractAddress: address.toLowerCase(),
        eventName: 'ValueSet',
        account: String(account).toLowerCase(),
        value: String(value),
        entryId: entryId.toString(),
        timestamp: timestamp.toString(),
        raw: {
          account,
          value,
          entryId: entryId.toString(),
          timestamp: timestamp.toString(),
        },
      };
      await this.rabbit.publishChainEvent(message);
      this.logger.log(`Published ValueSet from ${account}`);
    });

    contract.on('ValueCleared', async (account, timestamp, event) => {
      const log = event.log ?? event;
      const message: ChainEventMessage = {
        txHash: log.transactionHash,
        logIndex: Number(log.index ?? log.logIndex ?? 0),
        blockNumber: String(log.blockNumber),
        contractAddress: address.toLowerCase(),
        eventName: 'ValueCleared',
        account: String(account).toLowerCase(),
        timestamp: timestamp.toString(),
        raw: {
          account,
          timestamp: timestamp.toString(),
        },
      };
      await this.rabbit.publishChainEvent(message);
      this.logger.log(`Published ValueCleared from ${account}`);
    });

    this.logger.log(`Listening to SimpleRegistry at ${address}`);
  }
}
