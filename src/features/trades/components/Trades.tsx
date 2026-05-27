import { useEffect, useRef, useState, useDeferredValue } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Input } from '@/components/ui/input';
import { StressWsClient } from '@/lib/stress-ws/client';
import { useFocusStore } from '@/lib/stores/focus/focus.store';
import { TradesEngine } from '../engine/TradesEngine';
import { useTrades } from '../hooks/useTrades';
import TradeRow from './TradeRow';
import TradesStats from './TradesStats';
import type { ChannelName } from '@/lib/stress-ws/types';

const engine = TradesEngine.getInstance();
const DEFAULT_THRESHOLD = 10_000;

export function Trades() {
  const focusedSymbol = useFocusStore((s) => s.focusedSymbol);
  const snapshot = useTrades(focusedSymbol);
  const trades = snapshot?.trades ?? [];
  const stats = snapshot?.stats ?? null;

  const [threshold, setThreshold] = useState(DEFAULT_THRESHOLD.toString());
  const deferredThreshold = useDeferredValue(threshold);

  useEffect(() => {
    const n = Number(deferredThreshold) || DEFAULT_THRESHOLD;
    engine.setLargeTradeThreshold(n);
  }, [deferredThreshold]);

  useEffect(function subscribeToTrades() {
    const client = StressWsClient.getInstance();
    client.subscribe('all_trades' as ChannelName, [focusedSymbol]);
    const removeHandler = client.on('all_trades', (messages) => {
      engine.process(messages);
    });
    return () => {
      client.unsubscribe('all_trades' as ChannelName, [focusedSymbol]);
      engine.clear(focusedSymbol);
      removeHandler();
    };
  }, [focusedSymbol]);

  const scrollParentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: trades.length,
    getScrollElement: () => scrollParentRef.current,
    estimateSize: () => 28,
    overscan: 5,
    getItemKey: (i) => trades[i]?.id ?? i,
  });

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-md border border-border bg-card">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">Recent Trades — {focusedSymbol}</h2>
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

      <TradesStats stats={stats} />

      <div className="grid grid-cols-3 px-4 py-2 text-[11px] uppercase tracking-wide text-muted-foreground">
        <span>Time</span>
        <span className="text-center">Price (USD)</span>
        <span className="text-right">Size</span>
      </div>

      <div ref={scrollParentRef} className="h-96 overflow-y-auto">
        {trades.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Waiting for trades…
          </div>
        ) : (
          <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
            {virtualizer.getVirtualItems().map((vItem) => (
              <div
                key={vItem.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${vItem.start}px)`,
                  height: `${vItem.size}px`,
                }}
              >
                <TradeRow trade={trades[vItem.index]} />
              </div>
            ))}
          </div>
        )}
      </div>

      <footer
        className="cursor-pointer border-t border-border py-2 text-center text-xs text-muted-foreground hover:text-foreground"
        onClick={() => virtualizer.scrollToIndex(0)}
      >
        ↓ Jump to latest
      </footer>
    </section>
  );
}
