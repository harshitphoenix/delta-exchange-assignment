import type { ProcessedLevel, RawLevel } from './types';

const FULL_REBUILD_DIRTY_THRESHOLD = 32;

export function bucketPrice(price: number, increment: number, side: 'bid' | 'ask'): number {
  return side === 'bid'
    ? Math.floor(price / increment) * increment
    : Math.ceil(price / increment) * increment;
}

export class SideAggregator {
  readonly levels: ProcessedLevel[] = [];

  private readonly bucketTotals = new Map<number, number>();
  private readonly dirtyBuckets = new Set<number>();
  private increment = 1;
  private readonly side: 'bid' | 'ask';
  private forceFullRebuild = true;

  constructor(side: 'bid' | 'ask') {
    this.side = side;
  }

  setIncrement(increment: number): void {
    if (this.increment !== increment) {
      this.increment = increment;
      this.forceFullRebuild = true;
    }
  }

  requestFullRebuild(): void {
    this.forceFullRebuild = true;
  }

  applyDeltas(rawMap: Map<number, number>, levels: RawLevel[]): void {
    for (const [priceStr, sizeStr] of levels) {
      const price = Number(priceStr);
      const newSize = Number(sizeStr);
      const oldSize = rawMap.get(price) ?? 0;

      if (oldSize === newSize) continue;

      const bucket = bucketPrice(price, this.increment, this.side);

      if (oldSize > 0) {
        this.adjustBucket(bucket, -oldSize);
        this.dirtyBuckets.add(bucket);
      }

      if (newSize === 0) {
        rawMap.delete(price);
      } else {
        rawMap.set(price, newSize);
        this.adjustBucket(bucket, newSize);
        this.dirtyBuckets.add(bucket);
      }
    }
  }

  flush(rawMap: Map<number, number>): void {
    if (this.dirtyBuckets.size === 0 && !this.forceFullRebuild) return;

    if (this.shouldFullRebuild()) {
      this.fullRebuild(rawMap);
      return;
    }

    let minIndex = this.levels.length;
    for (const bucket of this.dirtyBuckets) {
      const index = this.applyDirtyBucket(bucket);
      if (index >= 0 && index < minIndex) minIndex = index;
    }
    this.dirtyBuckets.clear();

    if (minIndex < this.levels.length) {
      this.recomputeTotals(minIndex);
    }
  }

  private shouldFullRebuild(): boolean {
    if (this.forceFullRebuild) return true;
    if (this.levels.length === 0 && this.dirtyBuckets.size > 0) return true;
    if (this.dirtyBuckets.size > Math.max(FULL_REBUILD_DIRTY_THRESHOLD, this.levels.length >> 1)) {
      return true;
    }
    return false;
  }

  private adjustBucket(bucket: number, delta: number): void {
    const next = (this.bucketTotals.get(bucket) ?? 0) + delta;
    if (next <= 0) {
      this.bucketTotals.delete(bucket);
    } else {
      this.bucketTotals.set(bucket, next);
    }
  }

  private applyDirtyBucket(bucket: number): number {
    const size = this.bucketTotals.get(bucket) ?? 0;
    const index = this.findBucketIndex(bucket);
    const exists = index < this.levels.length && this.levels[index].price === bucket;

    if (size === 0) {
      if (exists) {
        this.levels.splice(index, 1);
        return index;
      }
      return -1;
    }

    if (exists) {
      this.levels[index].size = size;
      return index;
    }

    const row: ProcessedLevel = { price: bucket, size, total: 0 };
    this.levels.splice(index, 0, row);
    return index;
  }

  private findBucketIndex(bucket: number): number {
    const desc = this.side === 'bid';
    let lo = 0;
    let hi = this.levels.length;

    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      const cmp = this.levels[mid].price - bucket;
      if (desc ? cmp > 0 : cmp < 0) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }
    return lo;
  }

  private recomputeTotals(fromIndex: number): void {
    let running = fromIndex > 0 ? this.levels[fromIndex - 1].total : 0;
    for (let i = fromIndex; i < this.levels.length; i++) {
      running += this.levels[i].size;
      this.levels[i].total = running;
    }
  }

  private fullRebuild(rawMap: Map<number, number>): void {
    this.bucketTotals.clear();
    this.dirtyBuckets.clear();
    this.forceFullRebuild = false;

    for (const [price, size] of rawMap) {
      const bucket = bucketPrice(price, this.increment, this.side);
      this.bucketTotals.set(bucket, (this.bucketTotals.get(bucket) ?? 0) + size);
    }

    const sorted = [...this.bucketTotals.entries()].sort(
      this.side === 'bid' ? (a, b) => b[0] - a[0] : (a, b) => a[0] - b[0],
    );

    let running = 0;
    for (let i = 0; i < sorted.length; i++) {
      const [price, size] = sorted[i];
      running += size;
      if (i < this.levels.length) {
        this.levels[i].price = price;
        this.levels[i].size = size;
        this.levels[i].total = running;
      } else {
        this.levels.push({ price, size, total: running });
      }
    }

    if (this.levels.length > sorted.length) {
      this.levels.length = sorted.length;
    }
  }
}
