export type TradeSide = 'buy' | 'sell';

export interface Trade {
  id: string;
  timestamp: number;
  price: number;
  size: number;
  side: TradeSide;
  aggregatedCount?: number;
  isLarge?: boolean;
}

