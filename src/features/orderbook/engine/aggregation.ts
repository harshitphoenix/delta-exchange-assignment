import type { ProcessedLevel } from './types';

export const MAX_LEVELS = 25;

export function aggregate(
  map: Map<number, number>,
  increment: number,
  side: 'bid' | 'ask',
  out: ProcessedLevel[],
): void {
  const buckets = new Map<number, number>();
  for (const [price, size] of map) {
    const bucket =
      side === 'bid'
        ? Math.floor(price / increment) * increment
        : Math.ceil(price / increment) * increment;
    buckets.set(bucket, (buckets.get(bucket) ?? 0) + size);
  }

  const sorted = [...buckets.entries()].sort(
    side === 'bid' ? (a, b) => b[0] - a[0] : (a, b) => a[0] - b[0],
  );

  const limit = Math.min(sorted.length, MAX_LEVELS);
  let running = 0;

  for (let i = 0; i < limit; i++) {
    const [price, size] = sorted[i];
    running += size;
    if (i < out.length) {
      out[i].price = price;
      out[i].size = size;
      out[i].total = running;
    } else {
      out.push({ price, size, total: running });
    }
  }

  if (out.length > limit) out.splice(limit);
}
