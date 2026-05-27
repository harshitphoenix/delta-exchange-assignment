import { useOrderBookSnapshotStore } from '../store/orderbook.store';
import type { TradingSymbol } from '@/lib/symbols/config';
import type { ProcessedBook } from '../engine/types';

export function useOrderBook(symbol: TradingSymbol): ProcessedBook | null {
  return useOrderBookSnapshotStore((s) => s.snapshots[symbol] ?? null);
}
