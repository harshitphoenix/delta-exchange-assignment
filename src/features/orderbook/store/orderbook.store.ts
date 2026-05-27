import { create } from 'zustand';
import type { TradingSymbol } from '@/lib/symbols/config';
import type { ProcessedBook } from '../engine/types';

interface OrderBookSnapshotState {
  snapshots: Partial<Record<TradingSymbol, ProcessedBook | null>>;
}

export const useOrderBookSnapshotStore = create<OrderBookSnapshotState>()(() => ({
  snapshots: {},
}));
