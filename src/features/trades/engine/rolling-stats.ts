import type { RollingStats, TradeSide } from './types';

interface StatsEntry {
  timestamp: number; // microseconds
  size: number;
  side: TradeSide;
  notional: number;
}

const WINDOW_US = 60_000 * 1_000; // 60 s in microseconds
const ROLLUP_INTERVAL_MS = 1_000; // 1 Hz

export class RollingStatsTracker {
  private readonly entries: StatsEntry[] = [];
  // Index of the oldest valid entry — advances during prune instead of splicing
  private head = 0;
  private lastRollupMs = 0;
  private cachedStats: RollingStats | null = null;

  push(timestamp: number, price: number, size: number, side: TradeSide): void {
    this.entries.push({ timestamp, size, side, notional: price * size });
  }

  maybeRollup(nowMs: number): RollingStats | null {
    if (nowMs - this.lastRollupMs < ROLLUP_INTERVAL_MS) return null;
    this.lastRollupMs = nowMs;
    this.prune();
    this.cachedStats = this.compute();
    return this.cachedStats;
  }

  getCachedStats(): RollingStats | null {
    return this.cachedStats;
  }

  clear(): void {
    this.entries.length = 0;
    this.head = 0;
    this.lastRollupMs = 0;
    this.cachedStats = null;
  }

  private prune(): void {
    const cutoff = Date.now() * 1_000 - WINDOW_US;
    while (this.head < this.entries.length && this.entries[this.head].timestamp < cutoff) {
      this.head++;
    }
    // Compact backing array to avoid unbounded growth
    if (this.head > 500) {
      this.entries.splice(0, this.head);
      this.head = 0;
    }
  }

  private compute(): RollingStats {
    let buyVolume = 0;
    let sellVolume = 0;
    let totalSize = 0;
    for (let i = this.head; i < this.entries.length; i++) {
      const e = this.entries[i];
      if (e.side === 'buy') buyVolume += e.notional;
      else sellVolume += e.notional;
      totalSize += e.size;
    }
    const count = this.entries.length - this.head;
    return {
      buyVolume,
      sellVolume,
      tradeCount: count,
      avgSize: count > 0 ? totalSize / count : 0,
    };
  }
}
