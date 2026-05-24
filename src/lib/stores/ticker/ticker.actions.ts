import { useTickerStore } from './ticker.store';
import type { TickerSnapshot } from '@/features/ticker/types';

export const setTicker = (snapshot: TickerSnapshot): void => {
  useTickerStore.setState((s) => ({
    bySymbol: { ...s.bySymbol, [snapshot.symbol]: snapshot },
  }));
};
