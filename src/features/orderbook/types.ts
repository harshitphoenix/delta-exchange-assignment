export type Side = 'bid' | 'ask';

export interface OrderBookLevel {
  price: number;
  size: number;
  total: number;
}

export interface OrderBookSnapshot {
  symbol: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  mid: number;
  spread: number;
  spreadBps: number;
  imbalance: number;
}

/** Order book price bucket size for the focused symbol. */
export type GroupIncrement = number;
