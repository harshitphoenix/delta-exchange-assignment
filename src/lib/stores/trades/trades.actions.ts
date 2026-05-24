import { useTradesStore } from './trades.store';
import type { TradingSymbol } from '@/lib/symbols/config';
import type { Trade, RollingStats } from '@/features/trades/types';

const MAX_TRADES = 500;

export const addTrades = (symbol: TradingSymbol, incoming: Trade[]): void => {
  useTradesStore.setState((s) => {
    const prev = s.bySymbol[symbol]?.trades ?? [];
    const trades = [...incoming, ...prev].slice(0, MAX_TRADES);
    return {
      bySymbol: {
        ...s.bySymbol,
        [symbol]: { trades, stats: s.bySymbol[symbol]?.stats ?? null },
      },
    };
  });
};

export const setStats = (symbol: TradingSymbol, stats: RollingStats): void => {
  useTradesStore.setState((s) => ({
    bySymbol: {
      ...s.bySymbol,
      [symbol]: { trades: s.bySymbol[symbol]?.trades ?? [], stats },
    },
  }));
};

export const clearTrades = (symbol: TradingSymbol): void => {
  useTradesStore.setState((s) => ({
    bySymbol: { ...s.bySymbol, [symbol]: { trades: [], stats: null } },
  }));
};
