import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { DUMMY_BOOK } from '../data/dummy';
import type { GroupIncrement } from '../types';
import { GroupingSelector } from './GroupingSelector';
import { OrderBookSide } from './OrderBookSide';
import { SpreadMetrics } from './SpreadMetrics';

export function OrderBook() {
  const [group, setGroup] = useState<GroupIncrement>(1);
  const book = DUMMY_BOOK;

  const maxAskTotal = Math.max(...book.asks.map((l) => l.total));
  const maxBidTotal = Math.max(...book.bids.map((l) => l.total));

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-md border border-border bg-card">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Order Book — {book.symbol}</h2>
          <Badge className="bg-live/15 text-live hover:bg-live/15">LIVE</Badge>
        </div>
        <GroupingSelector value={group} onChange={setGroup} />
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
