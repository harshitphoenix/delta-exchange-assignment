export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

export type ChannelName = 'v2/ticker' | 'l2_orderbook' | 'all_trades';

export interface StatusUpdate {
  status: ConnectionStatus;
  channelCount: number;
  wsUrl: string;
}

export type MessageHandler = (message: unknown) => void;
export type StatusHandler = (update: StatusUpdate) => void;
