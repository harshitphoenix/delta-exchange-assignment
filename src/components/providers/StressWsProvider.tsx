import { useEffect, type ReactNode } from 'react';
import { StressWsClient } from '@/lib/stress-ws/client';
import { updateConnection } from '@/lib/stores/connection/connection.actions';
import { pushTicker, pushBook, pushTrade, cancelPendingFlush } from '@/lib/stress-ws/batcher';
import type { TradingSymbol } from '@/lib/symbols/config';
import type { RawBook, RawLevel } from '@/lib/stores/orderbook/orderbook.store';
import type { Trade } from '@/features/trades/types';

const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8080';

let _tradeSeq = 0;

function parseTradeTime(timestampUs: number): string {
  return new Date(timestampUs / 1000).toISOString().slice(11, 23);
}

export function StressWsProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const client = StressWsClient.getInstance();

    const unsubStatus = client.onStatus(updateConnection);

    const unsubTicker = client.on('v2/ticker', (raw) => {
      const msg = raw as Record<string, unknown>;
      if (!msg.symbol) return;
      pushTicker({
        symbol: msg.symbol as TradingSymbol,
        lastPrice: String(msg.close ?? msg.mark_price ?? ''),
        changePercent24h: String(msg.ltp_change_24h ?? '0'),
      });
    });

    const unsubBook = client.on('l2_orderbook', (raw) => {
      const msg = raw as Record<string, unknown>;
      if (!msg.symbol) return;
      pushBook({
        symbol: msg.symbol as TradingSymbol,
        bids: (msg.bids as RawLevel[]) ?? [],
        asks: (msg.asks as RawLevel[]) ?? [],
      } satisfies RawBook);
    });

    const unsubTrades = client.on('all_trades', (raw) => {
      const msg = raw as Record<string, unknown>;
      if (!msg.symbol) return;
      const price = Number(msg.price);
      const size = Number(msg.size);
      const trade: Trade = {
        id: String(++_tradeSeq),
        time: parseTradeTime(Number(msg.timestamp)),
        price,
        size,
        side: msg.buyer_role === 'taker' ? 'buy' : 'sell',
      };
      pushTrade(msg.symbol as TradingSymbol, trade);
    });

    client.connect(WS_URL);

    return () => {
      unsubStatus();
      unsubTicker();
      unsubBook();
      unsubTrades();
      cancelPendingFlush();
      client.disconnect();
    };
  }, []);

  return children;
}
