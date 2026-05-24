export type TradeSide = 'buy' | 'sell';

export interface Trade {
  id: string;
  time: string;
  price: number;
  size: number;
  side: TradeSide;
  aggregatedCount?: number;
  isLarge?: boolean;
}

export interface RollingStats {
  buyVolume: number;
  sellVolume: number;
  tradeCount: number;
  avgSize: number;
}
