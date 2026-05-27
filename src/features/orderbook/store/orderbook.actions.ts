import { useOrderBookSnapshotStore } from './orderbook.store';
import type { TradingSymbol } from '@/lib/symbols/config';
import type { ProcessedBook } from '../engine/types';

export function setSnapshot(symbol: TradingSymbol, book: ProcessedBook): void {
  useOrderBookSnapshotStore.setState((s) => ({
    snapshots: { ...s.snapshots, [symbol]: book },
  }));
}

export function clearSnapshot(symbol: TradingSymbol): void {
  useOrderBookSnapshotStore.setState((s) => ({
    snapshots: { ...s.snapshots, [symbol]: null },
  }));
}
