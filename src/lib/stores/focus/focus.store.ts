import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TradingSymbol } from '@/lib/symbols/config';

export interface FocusState {
  focusedSymbol: TradingSymbol;
  groupIncrements: Partial<Record<TradingSymbol, number>>;
}

export const useFocusStore = create<FocusState>()(
  persist(
    () => ({
      focusedSymbol: 'BTCUSD' as TradingSymbol,
      groupIncrements: {} as Partial<Record<TradingSymbol, number>>,
    }),
    {
      name: 'dashboard:focus',
    },
  ),
);
