import type { Trade } from '@/features/trades/types';

const WINDOW_US = 100_000; // 100 ms expressed in microseconds

/**
 * Merges consecutive trades at the same price that arrive within a 100ms window.
 *
 * Input must be newest-first (the order produced by the trades store).
 * Each merged group becomes a single Trade with:
 *   - size      = sum of all sizes in the group
 *   - aggregatedCount = number of trades merged (set only when > 1)
 *   - all other fields from the most-recent trade in the group
 */
export function aggregateTrades(trades: Trade[]): Trade[] {
  if (trades.length === 0) return trades;

  const result: Trade[] = [];

  let anchor = trades[0]; // most-recent trade in the current group
  let groupSize = trades[0].size;
  let groupCount = 1;

  for (let i = 1; i < trades.length; i++) {
    const t = trades[i];
    // anchor is always newer than t (newest-first order)
    const samePrice = t.price === anchor.price;
    const withinWindow = anchor.timestamp - t.timestamp <= WINDOW_US;

    if (samePrice && withinWindow) {
      groupSize += t.size;
      groupCount++;
    } else {
      result.push(buildRow(anchor, groupSize, groupCount));
      anchor = t;
      groupSize = t.size;
      groupCount = 1;
    }
  }

  result.push(buildRow(anchor, groupSize, groupCount));

  return result;
}

function buildRow(anchor: Trade, size: number, count: number): Trade {
  if (count === 1) return anchor;
  return { ...anchor, size, aggregatedCount: count };
}
