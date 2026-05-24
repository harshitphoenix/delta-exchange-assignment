import type { TradingSymbol } from '@/lib/symbols/config';
import type { TickerSnapshot } from '@/features/ticker/types';
import type { RawBook } from '@/lib/stores/orderbook/orderbook.store';
import { setTicker } from '@/lib/stores/ticker/ticker.actions';
import { setBook } from '@/lib/stores/orderbook/orderbook.actions';

// Latest per symbol — intermediate frames are dropped under load
const tickerBuffer = new Map<TradingSymbol, TickerSnapshot>();
const bookBuffer = new Map<TradingSymbol, RawBook>();

let rafId: number | null = null;

function flush(): void {
  tickerBuffer.forEach((snapshot) => setTicker(snapshot));
  tickerBuffer.clear();

  bookBuffer.forEach((book) => setBook(book));
  bookBuffer.clear();
}

function schedule(): void {
  if (rafId !== null) return;
  rafId = requestAnimationFrame(() => {
    rafId = null;
    flush();
  });
}

export function pushTicker(snapshot: TickerSnapshot): void {
  tickerBuffer.set(snapshot.symbol, snapshot);
  schedule();
}

export function pushBook(book: RawBook): void {
  bookBuffer.set(book.symbol, book);
  schedule();
}

export function cancelPendingFlush(): void {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}
