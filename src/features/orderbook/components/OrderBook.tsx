import { memo, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { StressWsClient } from '@/lib/stress-ws/client';
import { processBook } from '@/lib/orderbook/group';
import { useFocusStore } from '@/lib/stores/focus/focus.store';
import { setGroupIncrement } from '@/lib/stores/focus/focus.actions';
import { RawBook, RawLevel, useOrderBookStore } from '@/lib/stores/orderbook/orderbook.store';
import { clearBook } from '@/lib/stores/orderbook/orderbook.actions';
import type { GroupIncrement } from '../types';
import GroupingSelector  from './GroupingSelector';
import { OrderBookSide } from './OrderBookSide';
import { SpreadMetrics } from './SpreadMetrics';
import { pushBook } from '@/lib/stress-ws/batcher';
import { TradingSymbol } from '@/lib/symbols/config';

const OrderBook = ()=> {
  const focusedSymbol = useFocusStore((s) => s.focusedSymbol);
  const groupIncrement = (useFocusStore((s) => s.groupIncrements[focusedSymbol]) ?? 1) as GroupIncrement;
  const rawBook = useOrderBookStore((s) => s.bySymbol[focusedSymbol]);

  useEffect(function subscribeToOrderBook() {
    const client = StressWsClient.getInstance();
    client.subscribe('l2_orderbook', [focusedSymbol]);
    const removeHandler = client.on('l2_orderbook', (raw) => {
      const msg = raw as Record<string, unknown>;
      if (!msg.symbol) return;
      pushBook({
        symbol: msg.symbol as TradingSymbol,
        bids: (msg.bids as RawLevel[]) ?? [],
        asks: (msg.asks as RawLevel[]) ?? [],
      } satisfies RawBook);
    });
    return () => {
      client.unsubscribe('l2_orderbook', [focusedSymbol]);
      clearBook(focusedSymbol);
      removeHandler()
    };
  }, [focusedSymbol]);
  
  if (!rawBook) {
    return (
      <section className="flex h-full flex-col overflow-hidden rounded-md border border-border bg-card">
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
  
  const book = processBook(rawBook, groupIncrement);
  const maxAskTotal = book.asks.length ? Math.max(...book.asks.map((l) => l.total)) : 0;
  const maxBidTotal = book.bids.length ? Math.max(...book.bids.map((l) => l.total)) : 0;

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-md border border-border bg-card">
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

      <OrderBookSide side="ask" levels={book.asks} maxTotal={maxAskTotal} />
      <SpreadMetrics
        mid={book.mid}
        spread={book.spread}
        spreadBps={book.spreadBps}
        imbalance={book.imbalance}
      />
      <OrderBookSide side="bid" levels={book.bids} maxTotal={maxBidTotal} />
    </section>
  );
}

export default memo(OrderBook)
