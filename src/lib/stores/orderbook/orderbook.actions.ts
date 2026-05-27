import { useOrderBookStore } from './orderbook.store';
import type { NormalisedBook, RawBook, RawLevel } from './orderbook.store';
import type { TradingSymbol } from '@/lib/symbols/config';

const emptyBook = (symbol: TradingSymbol): NormalisedBook => ({
  symbol,
  asks: {},
  bids: {},
});

export const setBook = (book: RawBook): void => {
  const prevBook = useOrderBookStore.getState().bySymbol[book.symbol];
  const normalisedBook = normalisePrice(prevBook ?? emptyBook(book.symbol), book);
  useOrderBookStore.setState((s) => ({
    bySymbol: { ...s.bySymbol, [book.symbol]: normalisedBook },
  }));
};

export const clearBook = (symbol: TradingSymbol): void => {
  useOrderBookStore.setState((s) => ({
    bySymbol: { ...s.bySymbol, [symbol]: null },
  }));
};



function levelsToRecord(levels: RawLevel[]): Record<number, number> {
  const record: Record<number, number> = {};
  for (const [price, size] of levels) {
    const p = Number(price);
    const s = Number(size);
    record[p] = s;
  }
  return record;
}

function mergeSide(
  prev: Record<number, number>,
  levels: RawLevel[],
): Record<number, number> {
  const next = levelsToRecord(levels);

  for (const [priceKey, size] of Object.entries(next)) {
    const price = Number(priceKey);
      prev[price] = size;
  }

  return prev;
}

const normalisePrice = (prevBook: NormalisedBook, newBook: RawBook): NormalisedBook => ({
  symbol: newBook.symbol,
  asks: mergeSide(prevBook.asks, newBook.asks),
  bids: mergeSide(prevBook.bids, newBook.bids),
});
