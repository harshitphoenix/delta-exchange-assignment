import type { TradingSymbol } from '@/lib/symbols/config';
import type { TickerSnapshot } from '@/features/ticker/types';
import type { RawBook } from '@/lib/stores/orderbook/orderbook.store';
import type { Trade } from '@/features/trades/types';
import { setTicker } from '@/lib/stores/ticker/ticker.actions';
import { setBook } from '@/lib/stores/orderbook/orderbook.actions';
import { addTrades } from '@/lib/stores/trades/trades.actions';

// Latest per symbol — intermediate frames are dropped under load
const tickerBuffer = new Map<TradingSymbol, TickerSnapshot>();
const bookBuffer = new Map<TradingSymbol, RawBook>();
// Accumulates — all trades within a frame are flushed together
const tradesBuffer = new Map<TradingSymbol, Trade[]>();

let rafId: number | null = null;

function flush(): void {
  tickerBuffer.forEach((snapshot) => setTicker(snapshot));
  tickerBuffer.clear();

  bookBuffer.forEach((book) => setBook(book));
  bookBuffer.clear();

  tradesBuffer.forEach((trades, symbol) => addTrades(symbol, trades));
  tradesBuffer.clear();
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

export function pushTrade(symbol: TradingSymbol, trade: Trade): void {
  const buf = tradesBuffer.get(symbol);
  if (buf) {
    buf.push(trade);
  } else {
    tradesBuffer.set(symbol, [trade]);
  }
  schedule();
}

export function cancelPendingFlush(): void {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}
