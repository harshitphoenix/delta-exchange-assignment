import type { RawBook, RawLevel } from '@/lib/stores/orderbook/orderbook.store';

const MAX_LEVELS = 25;

export interface ProcessedLevel {
  price: number;
  size: number;
  total: number;
}

export interface ProcessedBook {
  symbol: string;
  bids: ProcessedLevel[];
  asks: ProcessedLevel[];
  mid: number;
  spread: number;
  spreadBps: number;
  imbalance: number;
}
export function processBook(
  raw: RawBook,
  increment: number
): ProcessedBook {

  const group = (
    levels: RawLevel[],
    round: "floor" | "ceil"
  ) => {
    const map = new Map<number, number>();
    for (const [price, size] of levels) {
      let bucket = Math.ceil( (Number(price) / increment) )* increment;
      if(round === "floor"){
        bucket = Math.floor(Number(price) / increment) * increment;
      }

      map.set(bucket, (map.get(bucket) ?? 0) + Number(size));
    }

    return map;
  };

  const bidMap = group(raw.bids, "floor");
  const askMap = group(raw.asks, "ceil");

  const bids = [...bidMap.entries()]
  .sort((a, b) => b[0] - a[0])
  .slice(0, MAX_LEVELS)
  .map(withRunningTotal());
  
  const asks = [...askMap.entries()]
  .sort((a, b) => a[0] - b[0])
  .slice(0, MAX_LEVELS)
  .map(withRunningTotal());
  
  console.log({bids, asks})
  const bestBid = bids[0]?.price ?? 0;
  const bestAsk = asks[0]?.price ?? 0;

  const spread = bestAsk - bestBid;
  const mid = (bestBid + bestAsk) / 2;

  const totalBid = bids.reduce((s, l) => s + l.size, 0);
  const totalAsk = asks.reduce((s, l) => s + l.size, 0);

  return {
    symbol: raw.symbol,
    bids,
    asks,
    mid,
    spread,
    spreadBps: mid ? (spread / mid) * 10_000 : 0,
    imbalance: totalAsk ? totalBid / totalAsk : 0,
  };
}

function withRunningTotal() {
  let total = 0;

  return ([price, size]: [number, number]) => {
    total += size;

    return {
      price,
      size,
      total,
    };
  };
}
