import { useOrderBookStore } from './orderbook.store';
import type { RawBook } from './orderbook.store';
import type { TradingSymbol } from '@/lib/symbols/config';

export const setBook = (book: RawBook): void => {
  useOrderBookStore.setState((s) => ({
    bySymbol: { ...s.bySymbol, [book.symbol]: book },
  }));
};

export const clearBook = (symbol: TradingSymbol): void => {
  useOrderBookStore.setState((s) => ({
    bySymbol: { ...s.bySymbol, [symbol]: null },
  }));
};
