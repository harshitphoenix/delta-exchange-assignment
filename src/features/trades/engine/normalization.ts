import type { RawTrade, Trade } from './types';

export function normalizeTrade(raw: RawTrade): Trade {
  const timestamp = Number(raw.timestamp);
  const price = Number(raw.price);
  const size = Number(raw.size);
  return {
    id: `${timestamp}_${price}_${size}`,
    timestamp,
    price,
    size,
    side: raw.buyer_role === 'taker' ? 'buy' : 'sell',
    isLarge: false, // flagged by aggregateInto
  };
}
