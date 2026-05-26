import { useDeferredValue, useRef, useState, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Input } from '@/components/ui/input';
import TradeRow from './TradeRow';
import TradesStats from './TradesStats';
import { StressWsClient } from '@/lib/stress-ws/client';
import type { ChannelName } from '@/lib/stress-ws/types';
import { useFocusStore } from '@/lib/stores/focus/focus.store';
import { useTradesStore } from '@/lib/stores/trades/trades.store';
import { clearTrades } from '@/lib/stores/trades/trades.actions';
import { dispatchToTradesWorker } from '@/lib/stress-ws/batcher';
import type { TradingSymbol } from '@/lib/symbols/config';
import type { Trade } from '../types';

export function Trades() {
  const [threshold, setThreshold] = useState('10000');
  const deferredThreshold = useDeferredValue(threshold);
  const focusedSymbol = useFocusStore((s) => s.focusedSymbol);
  const feed = useTradesStore((s) => s.bySymbol[focusedSymbol]);
  const trades = feed?.trades ?? [];

  useEffect(function subscribeToTrades() {
    const client = StressWsClient.getInstance();
    client.subscribe('all_trades' as ChannelName, [focusedSymbol]);
    const removeHandler = client.on('all_trades', (messages) => {
      const bySymbol = new Map<TradingSymbol, Trade[]>();
      for (const raw of messages) {
        const msg = raw as Record<string, unknown>;
        if (!msg.symbol) continue;
        const sym = msg.symbol as TradingSymbol;
        const trade: Trade = {
          id: `${msg.timestamp}_${msg.price}_${msg.size}`,
          timestamp: Number(msg.timestamp),
          price: Number(msg.price),
          size: Number(msg.size),
          side: msg.buyer_role === 'taker' ? 'buy' : 'sell',
        };
        const list = bySymbol.get(sym);
        if (list) list.push(trade);
        else bySymbol.set(sym, [trade]);
      }
      bySymbol.forEach((trades, sym) => dispatchToTradesWorker(sym, trades));
    });
    return () => {
      client.unsubscribe('all_trades' as ChannelName, [focusedSymbol]);
      clearTrades(focusedSymbol);
      removeHandler();
    };
  }, [focusedSymbol]);

  // Keep a ref so the interval callback always sees the latest trades without re-registering
  const tradesRef = useRef<Trade[]>(trades);
  useEffect(() => { tradesRef.current = trades; }, [trades]);

  const [stats, setStats] = useState<{ buyVolume: number; sellVolume: number; tradeCount: number; avgSize: number } | null>(null);

  useEffect(() => { setStats(null); }, [focusedSymbol]);

  useEffect(() => {
    const compute = () => {
      const cutoff = Date.now() - 60_000;
      const window = tradesRef.current.filter((t) => (t.timestamp / 1000) >= cutoff);
      if (!window.length) { setStats(null); return; }
      let buyVolume = 0, sellVolume = 0, totalSize = 0;
      for (const t of window) {
        const notional = t.price * t.size;
        if (t.side === 'buy') buyVolume += notional;
        else sellVolume += notional;
        totalSize += t.size;
      }
      setStats({ buyVolume, sellVolume, tradeCount: window.length, avgSize: totalSize / window.length });
    };
    compute();
    const id = setInterval(compute, 1_000);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const thresholdNum = Number(deferredThreshold) || 0;

  const scrollParentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: trades.length,
    getScrollElement: () => scrollParentRef.current,
    estimateSize: () => 28, // h-7
    overscan: 5,
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

      <div ref={scrollParentRef} className="flex-1 overflow-y-auto">
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
                <TradeRow
                  trade={trades[vItem.index]}
                  isLarge={trades[vItem.index].price * trades[vItem.index].size >= thresholdNum}
                />
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
