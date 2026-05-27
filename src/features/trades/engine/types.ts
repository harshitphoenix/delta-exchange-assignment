import type { TradingSymbol } from '@/lib/symbols/config';

export interface RawTrade {
  symbol: string;
  price: string | number;
  size: string | number;
  timestamp: number; // microseconds
  buyer_role?: string;
}

export type TradeSide = 'buy' | 'sell';

export interface Trade {
  id: string;
  timestamp: number; // microseconds
  price: number;
  size: number;
  side: TradeSide;
  aggregatedCount?: number;
  isLarge: boolean;
}

export interface RollingStats {
  buyVolume: number;
  sellVolume: number;
  tradeCount: number;
  avgSize: number;
}

export interface TradesSnapshot {
  symbol: TradingSymbol;
  trades: Trade[];
  stats: RollingStats | null;
  largeTradeThreshold: number;
}
