import type { TradingSymbol } from '@/lib/symbols/config';
import type { RawBook, ProcessedLevel, ProcessedBook } from './types';
import { applyDelta } from './normalization';
import { aggregate } from './aggregation';
import { computeMetrics } from './metrics';
import { setSnapshot, clearSnapshot } from '../store/orderbook.actions';

interface SymbolState {
  bids: Map<number, number>;
  asks: Map<number, number>;
  processedBids: ProcessedLevel[];
  processedAsks: ProcessedLevel[];
}

class OrderBookEngine {
  private static instance: OrderBookEngine | null = null;
  private readonly symbols = new Map<TradingSymbol, SymbolState>();

  static getInstance(): OrderBookEngine {
    if (!OrderBookEngine.instance) {
      OrderBookEngine.instance = new OrderBookEngine();
    }
    return OrderBookEngine.instance;
  }

  process(messages: RawBook[], groupIncrement: number): void {
    const dirty = new Set<TradingSymbol>();

    for (const msg of messages) {
      const symbol = msg.symbol;
      let state = this.symbols.get(symbol);
      if (!state) {
        state = { bids: new Map(), asks: new Map(), processedBids: [], processedAsks: [] };
        this.symbols.set(symbol, state);
      }
      applyDelta(state.bids, msg.bids);
      applyDelta(state.asks, msg.asks);
      dirty.add(symbol);
    }

    for (const symbol of dirty) {
      this.commit(symbol, groupIncrement);
    }
  }

  reprocess(symbol: TradingSymbol, groupIncrement: number): void {
    if (this.symbols.has(symbol)) {
      this.commit(symbol, groupIncrement);
    }
  }

  clear(symbol: TradingSymbol): void {
    this.symbols.delete(symbol);
    clearSnapshot(symbol);
  }

  private commit(symbol: TradingSymbol, groupIncrement: number): void {
    const state = this.symbols.get(symbol)!;
    aggregate(state.bids, groupIncrement, 'bid', state.processedBids);
    aggregate(state.asks, groupIncrement, 'ask', state.processedAsks);
    const metrics = computeMetrics(state.processedBids, state.processedAsks);
    const snapshot: ProcessedBook = {
      symbol,
      bids: state.processedBids,
      asks: state.processedAsks,
      ...metrics,
    };
    setSnapshot(symbol, snapshot);
  }
}

export { OrderBookEngine };
