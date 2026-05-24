import { useEffect, type ReactNode } from 'react';
import { StressWsClient } from '@/lib/stress-ws/client';
import { updateConnection } from '@/lib/stores/connection/connection.actions';
import { pushTicker, pushBook, cancelPendingFlush } from '@/lib/stress-ws/batcher';
import type { TradingSymbol } from '@/lib/symbols/config';
import type { RawBook, RawLevel } from '@/lib/stores/orderbook/orderbook.store';
import { setBook } from '@/lib/stores/orderbook/orderbook.actions';

const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8080';

export function StressWsProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const client = StressWsClient.getInstance();

    const unsubStatus = client.onStatus(updateConnection);

    // const unsubTicker = client.on('v2/ticker', (raw) => {
    //   const msg = raw as Record<string, unknown>;
    //   if (!msg.symbol) return;
    //   pushTicker({
    //     symbol: msg.symbol as TradingSymbol,
    //     lastPrice: String(msg.close ?? msg.mark_price ?? ''),
    //     changePercent24h: String(msg.ltp_change_24h ?? '0'),
    //   });
    // });

    const unsubBook = client.on('l2_orderbook', (raw) => {
      const msg = raw as Record<string, unknown>;
      if (!msg.symbol) return;
      setBook({
        symbol: msg.symbol as TradingSymbol,
        bids: ((msg.bids as RawLevel[]) ?? []),
        asks: ((msg.asks as RawLevel[]) ?? []),
      } satisfies RawBook);
      // console.log({msg}, (msg.bids as RawLevel[])[0])
      // pushBook({
      //   symbol: msg.symbol as TradingSymbol,
      //   bids: ((msg.bids as RawLevel[]) ?? []),
      //   asks: ((msg.asks as RawLevel[]) ?? []),
      // } satisfies RawBook);
    });

    client.connect(WS_URL);

    return () => {
      unsubStatus();
      // unsubTicker();
      unsubBook();
      cancelPendingFlush();
      client.disconnect();
    };
  }, []);

  return children;
}
