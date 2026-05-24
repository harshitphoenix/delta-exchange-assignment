import type { TradingSymbol } from '@/lib/symbols/config';

export type { TradingSymbol };

export interface TickerSnapshot {
  symbol: TradingSymbol;
  lastPrice: string;
  changePercent24h: string;
}
