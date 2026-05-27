import type { ProcessedLevel } from './types';

export interface BookMetrics {
  mid: number;
  spread: number;
  spreadBps: number;
  imbalance: number;
  maxBidTotal: number;
  maxAskTotal: number;
}

export function computeMetrics(bids: ProcessedLevel[], asks: ProcessedLevel[]): BookMetrics {
  const bestBid = bids[0]?.price ?? 0;
  const bestAsk = asks[0]?.price ?? 0;
  const spread = bestAsk - bestBid;
  const mid = (bestBid + bestAsk) / 2;

  // Running total of last element = sum of all visible sizes
  const maxBidTotal = bids.length ? bids[bids.length - 1].total : 0;
  const maxAskTotal = asks.length ? asks[asks.length - 1].total : 0;

  return {
    mid,
    spread,
    spreadBps: mid ? (spread / mid) * 10_000 : 0,
    imbalance: maxAskTotal ? maxBidTotal / maxAskTotal : 0,
    maxBidTotal,
    maxAskTotal,
  };
}
