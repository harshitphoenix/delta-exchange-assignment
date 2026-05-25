import type { TradingSymbol } from '@/lib/symbols/config';
import type { TickerSnapshot } from '@/features/ticker/types';
import type { RawBook } from '@/lib/stores/orderbook/orderbook.store';
import type { Trade } from '@/features/trades/types';
import { setTicker } from '@/lib/stores/ticker/ticker.actions';
import { setBook } from '@/lib/stores/orderbook/orderbook.actions';
import { addTrades } from '@/lib/stores/trades/trades.actions';
import { aggregateTrades } from '../trades/aggregate';

// ── Ticker ────────────────────────────────────────────────────────────────────
// Latest-wins per symbol — intermediate frames are dropped under load

const tickerBuffer = new Map<TradingSymbol, TickerSnapshot>();
let tickerRafId: number | null = null;

function flushTicker(): void {
  tickerBuffer.forEach((snapshot) => setTicker(snapshot));
  tickerBuffer.clear();
}

function scheduleTicker(): void {
  if (tickerRafId !== null) return;
  tickerRafId = requestAnimationFrame(() => { tickerRafId = null; flushTicker(); });
}

export function pushTicker(snapshot: TickerSnapshot): void {
  tickerBuffer.set(snapshot.symbol, snapshot);
  scheduleTicker();
}

// ── Order Book ────────────────────────────────────────────────────────────────
// Latest-wins per symbol

const bookBuffer = new Map<TradingSymbol, RawBook>();
let bookRafId: number | null = null;

function flushBook(): void {
  bookBuffer.forEach((book) => setBook(book));
  bookBuffer.clear();
}

function scheduleBook(): void {
  if (bookRafId !== null) return;
  bookRafId = requestAnimationFrame(() => { bookRafId = null; flushBook(); });
}

export function pushBook(book: RawBook): void {
  bookBuffer.set(book.symbol, book);
  scheduleBook();
}

// ── Trades ────────────────────────────────────────────────────────────────────
// Accumulates — all trades within a frame are aggregated then flushed together

const tradesBuffer = new Map<TradingSymbol, Trade[]>();
let tradesRafId: number | null = null;

function flushTrades(): void {
  tradesBuffer.forEach((trades, symbol) => addTrades(symbol, aggregateTrades(trades)));
  tradesBuffer.clear();
}

function scheduleTrades(): void {
  if (tradesRafId !== null) return;
  tradesRafId = requestAnimationFrame(() => { tradesRafId = null; flushTrades(); });
}

export function pushTrade(symbol: TradingSymbol, trade: Trade): void {
  const buf = tradesBuffer.get(symbol);
  if (buf) {
    buf.push(trade);
  } else {
    tradesBuffer.set(symbol, [trade]);
  }
  scheduleTrades();
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

export function cancelPendingFlush(): void {
  if (tickerRafId !== null) { cancelAnimationFrame(tickerRafId); tickerRafId = null; }
  if (bookRafId !== null) { cancelAnimationFrame(bookRafId); bookRafId = null; }
  if (tradesRafId !== null) { cancelAnimationFrame(tradesRafId); tradesRafId = null; }
}
