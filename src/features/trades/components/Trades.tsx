import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { DUMMY_STATS, DUMMY_TRADES } from '../data/dummy';
import { TradeRow } from './TradeRow';
import { TradesStats } from './TradesStats';

export function Trades() {
  const [threshold, setThreshold] = useState('10000');

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-md border border-border bg-card">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">Recent Trades — ETHUSD</h2>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Large trade ≥</span>
          <div className="flex items-center gap-1 rounded border border-border bg-muted/40 px-2">
            <span>$</span>
            <Input
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="h-7 w-20 border-0 bg-transparent p-0 text-right text-xs shadow-none focus-visible:ring-0 dark:bg-transparent"
              inputMode="numeric"
            />
          </div>
        </label>
      </header>

      <TradesStats stats={DUMMY_STATS} />

      <div className="grid grid-cols-3 px-4 py-2 text-[11px] uppercase tracking-wide text-muted-foreground">
        <span>Time</span>
        <span className="text-center">Price (USD)</span>
        <span className="text-right">Size (BTC)</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {DUMMY_TRADES.map((trade) => (
          <TradeRow key={trade.id} trade={trade} />
        ))}
      </div>

      <footer className="border-t border-border py-2 text-center text-xs text-muted-foreground">
        ↓ Jump to latest
      </footer>
    </section>
  );
}
