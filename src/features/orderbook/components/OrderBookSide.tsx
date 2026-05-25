import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { OrderBookLevel, Side } from '../types';
import OrderBookRow from './OrderBookRow';

interface OrderBookSideProps {
  side: Side;
  levels: OrderBookLevel[];
  maxTotal: number;
}

const MAX_LEVELS = 300;

export function OrderBookSide({ side, levels, maxTotal }: OrderBookSideProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  // const virtualizer = useVirtualizer({
  //   count: MAX_LEVELS,
  //   getScrollElement: () => parentRef.current,
  //   estimateSize: () => 24, // h-6
  //   overscan: 3,
  // });

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
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="grid grid-cols-3 px-3 py-2 text-[11px] uppercase tracking-wide text-muted-foreground">
        {header}
      </div>
      <div ref={parentRef} className="flex-1 overflow-y-auto">
        <div>
          {levels.map((level, index) => (
            <div
              key={`${level.price}_${index}`}
              style={{
                // position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                // transform: `translateY(${vItem.start}px)`,
                // height: `${vItem.size}px`,
              }}
            >
              <OrderBookRow
                level={level}
                side={side}
                maxTotal={maxTotal}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
