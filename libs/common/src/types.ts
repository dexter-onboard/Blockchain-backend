export const CHAIN_EVENTS_EXCHANGE = 'chain.events';
export const CHAIN_EVENTS_QUEUE_INDEXER = 'chain.events.indexer';
export const CHAIN_EVENTS_QUEUE_NOTIFICATION = 'chain.events.notification';
export const CHAIN_EVENTS_ROUTING_KEY = 'chain.event';

export interface ChainEventMessage {
  txHash: string;
  logIndex: number;
  blockNumber: string;
  contractAddress: string;
  eventName: string;
  account?: string;
  value?: string;
  entryId?: string;
  timestamp?: string;
  raw: Record<string, unknown>;
}
