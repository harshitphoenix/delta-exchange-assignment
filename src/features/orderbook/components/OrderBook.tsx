import { memo, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { StressWsClient } from '@/lib/stress-ws/client';
import { useFocusStore } from '@/lib/stores/focus/focus.store';
import { setGroupIncrement } from '@/lib/stores/focus/focus.actions';
import { OrderBookEngine } from '../engine/OrderBookEngine';
import { useOrderBook } from '../hooks/useOrderBook';
import type { RawBook } from '../engine/types';
import type { GroupIncrement } from '../types';
import GroupingSelector from './GroupingSelector';
import { OrderBookSide } from './OrderBookSide';
import { SpreadMetrics } from './SpreadMetrics';
import type { TradingSymbol } from '@/lib/symbols/config';

const engine = OrderBookEngine.getInstance();

const OrderBook = () => {
  const focusedSymbol = useFocusStore((s) => s.focusedSymbol);
  const groupIncrement = (useFocusStore((s) => s.groupIncrements[focusedSymbol]) ?? 1) as GroupIncrement;
  const snapshot = useOrderBook(focusedSymbol);

  // Keep a ref so the RAF-batched WS handler always reads the latest increment
  const groupIncrementRef = useRef(groupIncrement);
  useEffect(() => { groupIncrementRef.current = groupIncrement; }, [groupIncrement]);

  useEffect(function subscribeToOrderBook() {
    const client = StressWsClient.getInstance();
    client.subscribe('l2_orderbook', [focusedSymbol]);
    const removeHandler = client.on('l2_orderbook', (messages) => {
      const rawBooks: RawBook[] = [];
      for (const raw of messages) {
        const msg = raw as Record<string, unknown>;
        if (!msg.symbol) continue;
        rawBooks.push({
          symbol: msg.symbol as TradingSymbol,
          bids: msg.bids as RawBook['bids'],
          asks: msg.asks as RawBook['asks'],
        });
      }
      if (rawBooks.length) engine.process(rawBooks, groupIncrementRef.current);
    });
    return () => {
      client.unsubscribe('l2_orderbook', [focusedSymbol]);
      engine.clear(focusedSymbol);
      removeHandler();
    };
  }, [focusedSymbol]);

  // Re-aggregate when grouping changes (symbol change is handled by subscribeToOrderBook)
  useEffect(() => {
    engine.reprocess(focusedSymbol, groupIncrement);
  }, [focusedSymbol, groupIncrement]);

  if (!snapshot) {
    return (
      <section className="flex h-384 flex-col overflow-auto flex-col overflow-hidden rounded-md border border-border bg-card">
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">Order Book — {focusedSymbol}</h2>
            <Badge className="bg-live/15 text-live hover:bg-live/15">LIVE</Badge>
          </div>
        </header>
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Waiting for data…
        </div>
      </section>
    );
  }

  return (
    <section className="flex h-384 flex-col overflow-auto rounded-md border border-border bg-card">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Order Book — {focusedSymbol}</h2>
          <Badge className="bg-live/15 text-live hover:bg-live/15">LIVE</Badge>
        </div>
        <GroupingSelector
          value={groupIncrement}
          onChange={(v) => setGroupIncrement(focusedSymbol, v)}
        />
      </header>

      <OrderBookSide side="ask" levels={snapshot.asks} maxTotal={snapshot.maxAskTotal} />
      <div className="shrink-0">
        <SpreadMetrics
          mid={snapshot.mid}
          spread={snapshot.spread}
          spreadBps={snapshot.spreadBps}
          imbalance={snapshot.imbalance}
        />
      </div>
      <OrderBookSide side="bid" levels={snapshot.bids} maxTotal={snapshot.maxBidTotal} />
    </section>
  );
};

export default memo(OrderBook);
