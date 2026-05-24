import { create } from 'zustand';
import type { TradingSymbol } from '@/lib/symbols/config';
import type { Trade, RollingStats } from '@/features/trades/types';

export interface TradesFeedState {
  trades: Trade[];
  stats: RollingStats | null;
}

export interface TradesState {
  bySymbol: Partial<Record<TradingSymbol, TradesFeedState>>;
}

export const useTradesStore = create<TradesState>()(() => ({
  bySymbol: {},
}));
