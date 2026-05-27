import type { TradingSymbol } from '@/lib/symbols/config';
import type { RawTrade, Trade, TradesSnapshot } from './types';
import { normalizeTrade } from './normalization';
import { RingBuffer } from './ring-buffer';
import { aggregateInto } from './aggregation';
import { RollingStatsTracker } from './rolling-stats';
import { setTradesSnapshot, clearTradesSnapshot } from '../store/trades.actions';

const MAX_TRADES = 500;
const DEFAULT_THRESHOLD = 10_000;

interface SymbolState {
  buffer: RingBuffer;
  aggregated: Trade[];
  statsTracker: RollingStatsTracker;
}

function createSymbolState(): SymbolState {
  return {
    buffer: new RingBuffer(MAX_TRADES),
    aggregated: [],
    statsTracker: new RollingStatsTracker(),
  };
}

class TradesEngine {
  private static instance: TradesEngine | null = null;
  private readonly symbols = new Map<TradingSymbol, SymbolState>();
  private largeTradeThreshold = DEFAULT_THRESHOLD;

  static getInstance(): TradesEngine {
    if (!TradesEngine.instance) {
      TradesEngine.instance = new TradesEngine();
    }
    return TradesEngine.instance;
  }

  process(rawMessages: unknown[]): void {
    const bySymbol = new Map<TradingSymbol, RawTrade[]>();

    for (const raw of rawMessages) {
      const msg = raw as Record<string, unknown>;
      if (!msg.symbol) continue;
      const sym = msg.symbol as TradingSymbol;
      const list = bySymbol.get(sym);
      if (list) list.push(msg as unknown as RawTrade);
      else bySymbol.set(sym, [msg as unknown as RawTrade]);
    }

    for (const [symbol, raws] of bySymbol) {
      this.processBatch(symbol, raws);
    }
  }

  setLargeTradeThreshold(threshold: number): void {
    if (this.largeTradeThreshold === threshold) return;
    this.largeTradeThreshold = threshold;
    // Re-aggregate all active symbols with new threshold
    for (const [symbol, state] of this.symbols) {
      aggregateInto(state.buffer.items, state.aggregated, threshold);
      this.commit(symbol, state);
    }
  }

  clear(symbol: TradingSymbol): void {
    this.symbols.delete(symbol);
    clearTradesSnapshot(symbol);
  }

  private processBatch(symbol: TradingSymbol, raws: RawTrade[]): void {
    let state = this.symbols.get(symbol);
    if (!state) {
      state = createSymbolState();
      this.symbols.set(symbol, state);
    }

    // Normalize and sort newest-first before prepending
    const normalized = raws.map(normalizeTrade).sort((a, b) => b.timestamp - a.timestamp);

    // Push raw trades to stats deque before aggregation
    for (const trade of normalized) {
      state.statsTracker.push(trade.timestamp, trade.price, trade.size, trade.side);
    }

    // Prepend to ring buffer (newest-first)
    state.buffer.prependMany(normalized);

    // Re-aggregate full buffer — fixes cross-batch same-price merging
    aggregateInto(state.buffer.items, state.aggregated, this.largeTradeThreshold);

    this.commit(symbol, state);
  }

  private commit(symbol: TradingSymbol, state: SymbolState): void {
    const nowMs = Date.now();
    const freshStats = state.statsTracker.maybeRollup(nowMs);
    const stats = freshStats ?? state.statsTracker.getCachedStats();

    const snapshot: TradesSnapshot = {
      symbol,
      trades: state.aggregated,
      stats,
      largeTradeThreshold: this.largeTradeThreshold,
    };
    setTradesSnapshot(symbol, snapshot);
  }
}

export { TradesEngine };
