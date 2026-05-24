import type { OrderBookLevel, Side } from '../types';
import { OrderBookRow } from './OrderBookRow';

interface OrderBookSideProps {
  side: Side;
  levels: OrderBookLevel[];
  maxTotal: number;
}

export function OrderBookSide({ side, levels, maxTotal }: OrderBookSideProps) {
  const isBid = side === 'bid';
  const header = isBid ? (
    <>
      <span>Price (USD)</span>
      <span className="text-center">Size (BTC)</span>
      <span className="text-right">Total (BTC)</span>
    </>
  ) : (
    <>
      <span>Total (BTC)</span>
      <span className="text-center">Size (BTC)</span>
      <span className="text-right">Price (USD)</span>
    </>
  );

  return (
    <div className="flex flex-1 flex-col">
      <div className="grid grid-cols-3 px-3 py-2 text-[11px] uppercase tracking-wide text-muted-foreground">
        {header}
      </div>
      <div className="flex flex-col">
        {levels.map((level) => (
          <OrderBookRow key={level.price} level={level} side={side} maxTotal={maxTotal} />
        ))}
      </div>
    </div>
  );
}
