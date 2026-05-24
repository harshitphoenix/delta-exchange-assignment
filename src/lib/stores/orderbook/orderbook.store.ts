import { create } from 'zustand';
import type { TradingSymbol } from '@/lib/symbols/config';

/** [price, size] — wire format from l2_orderbook channel */
export type RawLevel = [price: string, size: string];

export interface RawBook {
  symbol: TradingSymbol;
  bids: RawLevel[];
  asks: RawLevel[];
}

export interface OrderBookState {
  bySymbol: Partial<Record<TradingSymbol, RawBook | null>>;
}

export const useOrderBookStore = create<OrderBookState>()(() => ({
  bySymbol: {},
}));
