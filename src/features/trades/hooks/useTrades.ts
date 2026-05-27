import { useTradesSnapshotStore } from '../store/trades.store';
import type { TradingSymbol } from '@/lib/symbols/config';
import type { TradesSnapshot } from '../engine/types';

export function useTrades(symbol: TradingSymbol): TradesSnapshot | null {
  return useTradesSnapshotStore((s) => s.snapshots[symbol] ?? null);
}
