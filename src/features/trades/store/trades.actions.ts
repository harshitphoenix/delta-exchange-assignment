import { useTradesSnapshotStore } from './trades.store';
import type { TradingSymbol } from '@/lib/symbols/config';
import type { TradesSnapshot } from '../engine/types';

export function setTradesSnapshot(symbol: TradingSymbol, snapshot: TradesSnapshot): void {
  useTradesSnapshotStore.setState((s) => ({
    snapshots: { ...s.snapshots, [symbol]: snapshot },
  }));
}

export function clearTradesSnapshot(symbol: TradingSymbol): void {
  useTradesSnapshotStore.setState((s) => ({
    snapshots: { ...s.snapshots, [symbol]: null },
  }));
}
