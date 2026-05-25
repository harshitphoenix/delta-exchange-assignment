import { useMemo, useRef, useState, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Input } from '@/components/ui/input';
import TradeRow from './TradeRow';
import { TradesStats } from './TradesStats';
import { StressWsClient } from '@/lib/stress-ws/client';
import type { ChannelName } from '@/lib/stress-ws/types';
import { useFocusStore } from '@/lib/stores/focus/focus.store';
import { useTradesStore } from '@/lib/stores/trades/trades.store';
import { clearTrades } from '@/lib/stores/trades/trades.actions';
import type { RollingStats, Trade } from '../types';
const MAX_TRADES = 500;
export function Trades() {
  const [threshold, setThreshold] = useState('10000');
  const focusedSymbol = useFocusStore((s) => s.focusedSymbol);
  const feed = useTradesStore((s) => s.bySymbol[focusedSymbol]);
  const trades = feed?.trades ?? [];

  useEffect(() => {
    const client = StressWsClient.getInstance();
    client.subscribe('all_trades' as ChannelName, [focusedSymbol]);
    return () => {
      client.unsubscribe('all_trades' as ChannelName, [focusedSymbol]);
      clearTrades(focusedSymbol);
    };
  }, [focusedSymbol]);

  const stats = useMemo((): RollingStats | null => {
    if (!trades.length) return null;
    let buyVolume = 0;
    let sellVolume = 0;
    let totalSize = 0;
    for (const t of trades) {
      const notional = t.price * t.size;
      if (t.side === 'buy') buyVolume += notional;
      else sellVolume += notional;
      totalSize += t.size;
    }
    return {
      buyVolume,
      sellVolume,
      tradeCount: trades.length,
      avgSize: totalSize / trades.length,
    };
  }, [trades]);

  const thresholdNum = Number(threshold) || 0;

  const scrollParentRef = useRef<HTMLDivElement>(null);

  // const virtualizer = useVirtualizer({
  //   count: MAX_TRADES,
  //   getScrollElement: () => scrollParentRef.current,
  //   estimateSize: () => 28,
  //   overscan: 5,
  // });

  const enriched = (trade: Trade) => ({
    ...trade,
    isLarge: trade.price * trade.size >= thresholdNum,
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

      {stats && <TradesStats stats={stats} />}

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
          <div>
            {/* {virtualizer.getVirtualItems().map((vItem,index) => ( */}
            {trades.map((trade, index) => (
              <div
                key={`${trade.id}_${index}`}
                style={{
                  // position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  // transform: `translateY(${vItem.start}px)`,
                  // height: `${vItem.size}px`,
                }}
              >
                <TradeRow trade={enriched(trade)} />
              </div>
            ))}
          </div>
        )}
      </div>

      <footer
        className="cursor-pointer border-t border-border py-2 text-center text-xs text-muted-foreground hover:text-foreground"
        // onClick={() => virtualizer.scrollToIndex(0)}
      >
        ↓ Jump to latest
      </footer>
    </section>
  );
}
