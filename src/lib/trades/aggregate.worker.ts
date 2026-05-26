/// <reference lib="webworker" />
import { aggregateTrades } from './aggregate';
import type { Trade } from '@/features/trades/types';

interface WorkerInput {
  symbol: string;
  trades: Trade[];
}

self.onmessage = ({ data }: MessageEvent<WorkerInput>) => {
  self.postMessage({ symbol: data.symbol, aggregated: aggregateTrades(data.trades) });
};
