import { create } from 'zustand';
import type { TradingSymbol } from '@/lib/symbols/config';
import type { TickerSnapshot } from '@/features/ticker/types';

export interface TickerState {
  bySymbol: Partial<Record<TradingSymbol, TickerSnapshot>>;
}

export const useTickerStore = create<TickerState>()(() => ({
  bySymbol: {},
}));
