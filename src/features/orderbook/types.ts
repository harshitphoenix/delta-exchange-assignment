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

export type GroupIncrement = 1 | 5 | 10 | 50 | 100 | 500;
