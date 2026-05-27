import type { TradingSymbol } from '@/lib/symbols/config';

export type RawLevel = [price: string, size: string];

export interface RawBook {
  symbol: TradingSymbol;
  bids: RawLevel[];
  asks: RawLevel[];
}

export interface ProcessedLevel {
  price: number;
  size: number;
  total: number;
}

export interface ProcessedBook {
  symbol: TradingSymbol;
  bids: ProcessedLevel[];
  asks: ProcessedLevel[];
  maxBidTotal: number;
  maxAskTotal: number;
  mid: number;
  spread: number;
  spreadBps: number;
  imbalance: number;
}
