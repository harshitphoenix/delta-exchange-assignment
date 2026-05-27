import type { Trade } from './types';

const WINDOW_US = 100_000; // 100 ms in microseconds

/**
 * Aggregates a newest-first buffer into the output array in place.
 * Consecutive trades at the same price within WINDOW_US are merged.
 * Reuses existing output slot object references when content is unchanged
 * to give React.memo(TradeRow) stable references on unchanged rows.
 */
export function aggregateInto(
  buffer: Trade[],
  out: Trade[],
  largeTradeThreshold: number,
): void {
  if (buffer.length === 0) {
    out.length = 0;
    return;
  }

  let writeIdx = 0;
  let anchor = buffer[0];
  let groupSize = anchor.size;
  let groupCount = 1;

  const flush = () => {
    const isLarge = anchor.price * groupSize >= largeTradeThreshold;
    const aggregatedCount = groupCount > 1 ? groupCount : undefined;
    const existing = out[writeIdx];

    if (
      existing &&
      existing.id === anchor.id &&
      existing.size === groupSize &&
      existing.aggregatedCount === aggregatedCount &&
      existing.isLarge === isLarge
    ) {
      // Unchanged — keep stable object reference for React.memo
    } else {
      out[writeIdx] = {
        id: anchor.id,
        timestamp: anchor.timestamp,
        price: anchor.price,
        size: groupSize,
        side: anchor.side,
        aggregatedCount,
        isLarge,
      };
    }
    writeIdx++;
  };

  for (let i = 1; i < buffer.length; i++) {
    const t = buffer[i];
    // anchor is always newer (newest-first buffer)
    if (t.price === anchor.price && anchor.timestamp - t.timestamp <= WINDOW_US) {
      groupSize += t.size;
      groupCount++;
    } else {
      flush();
      anchor = t;
      groupSize = t.size;
      groupCount = 1;
    }
  }
  flush();

  if (out.length > writeIdx) out.splice(writeIdx);
}
