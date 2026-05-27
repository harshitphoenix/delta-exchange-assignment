import { create } from 'zustand';
import type { TradingSymbol } from '@/lib/symbols/config';
import type { TradesSnapshot } from '../engine/types';

interface TradesSnapshotState {
  snapshots: Partial<Record<TradingSymbol, TradesSnapshot | null>>;
}

export const useTradesSnapshotStore = create<TradesSnapshotState>()(() => ({
  snapshots: {},
}));
