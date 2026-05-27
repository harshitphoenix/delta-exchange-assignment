import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { ProcessedLevel, } from '../engine/types';
import type { Side } from '../types';
import { SYMBOL_CONFIG, type TradingSymbol } from '@/lib/symbols/config';
import OrderBookRow from './OrderBookRow';

interface OrderBookSideProps {
  symbol: TradingSymbol;
  side: Side;
  levels: ProcessedLevel[];
  maxTotal: number;
}

export function OrderBookSide({ symbol, side, levels, maxTotal }: OrderBookSideProps) {
  const baseName = SYMBOL_CONFIG[symbol].baseName;
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: levels.length,
    getScrollElement: () => parentRef.current,
    getItemKey: (index) => levels[index]?.price ?? index,
    estimateSize: () => 24,
    overscan: 3,
  });

  const isBid = side === 'bid';
  const header = isBid ? (
    <>
      <span>Price (USD)</span>
      <span className="text-center">Size ({baseName})</span>
      <span className="text-right">Total ({baseName})</span>
    </>
  ) : (
    <>
      <span>Total ({baseName})</span>
      <span className="text-center">Size ({baseName})</span>
      <span className="text-right">Price (USD)</span>
    </>
  );

  return (
    <div className="flex flex-col overflow-auto">
      <div className="grid grid-cols-3 px-3 py-2 text-[11px] uppercase tracking-wide text-muted-foreground">
        {header}
      </div>
      <div ref={parentRef} className="h-96 overflow-y-auto">
        <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
          {virtualizer.getVirtualItems().map((vItem) => {
            const level = levels[vItem.index];
            return (
              <div
                key={vItem.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${vItem.start}px)`,
                  height: `${vItem.size}px`,
                }}
              >
                <OrderBookRow
                  symbol={symbol}
                  price={level.price}
                  size={level.size}
                  total={level.total}
                  maxTotal={maxTotal}
                  side={side}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
