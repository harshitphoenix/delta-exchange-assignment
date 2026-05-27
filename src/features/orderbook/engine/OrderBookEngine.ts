import type { TradingSymbol } from '@/lib/symbols/config';
import type { RawBook } from './types';
import { SideAggregator } from './aggregation';
import { computeMetrics } from './metrics';
import { setSnapshot, clearSnapshot } from '../store/orderbook.actions';

interface SymbolState {
  bids: Map<number, number>;
  asks: Map<number, number>;
  bidSide: SideAggregator;
  askSide: SideAggregator;
  lastIncrement: number;
}

function createSymbolState(): SymbolState {
  return {
    bids: new Map(),
    asks: new Map(),
    bidSide: new SideAggregator('bid'),
    askSide: new SideAggregator('ask'),
    lastIncrement: -1,
  };
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
        state = createSymbolState();
        this.symbols.set(symbol, state);
      }

      this.syncIncrement(state, groupIncrement);
      state.bidSide.applyDeltas(state.bids, msg.bids);
      state.askSide.applyDeltas(state.asks, msg.asks);
      dirty.add(symbol);
    }

    for (const symbol of dirty) {
      this.commit(symbol);
    }
  }

  reprocess(symbol: TradingSymbol, groupIncrement: number): void {
    const state = this.symbols.get(symbol);
    if (!state) return;

    this.syncIncrement(state, groupIncrement);
    state.bidSide.requestFullRebuild();
    state.askSide.requestFullRebuild();
    this.commit(symbol);
  }

  clear(symbol: TradingSymbol): void {
    this.symbols.delete(symbol);
    clearSnapshot(symbol);
  }

  private syncIncrement(state: SymbolState, groupIncrement: number): void {
    if (state.lastIncrement === groupIncrement) return;
    state.bidSide.setIncrement(groupIncrement);
    state.askSide.setIncrement(groupIncrement);
    state.lastIncrement = groupIncrement;
  }

  private commit(symbol: TradingSymbol): void {
    const state = this.symbols.get(symbol)!;
    state.bidSide.flush(state.bids);
    state.askSide.flush(state.asks);

    const metrics = computeMetrics(state.bidSide.levels, state.askSide.levels);
    setSnapshot(symbol, {
      symbol,
      bids: state.bidSide.levels,
      asks: state.askSide.levels,
      ...metrics,
    });
  }
}

export { OrderBookEngine };
