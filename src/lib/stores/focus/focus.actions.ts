import { useFocusStore } from './focus.store';
import type { TradingSymbol } from '@/lib/symbols/config';

export const setFocusedSymbol = (symbol: TradingSymbol): void => {
  useFocusStore.setState({ focusedSymbol: symbol });
};

export const setGroupIncrement = (symbol: TradingSymbol, increment: number): void => {
  useFocusStore.setState((s) => ({
    groupIncrements: { ...s.groupIncrements, [symbol]: increment },
  }));
};
