import { memo, useMemo } from 'react';
import { formatCount, formatSize, formatVolume } from '@/lib/format';

type Props = {
  stats: Stats | null;
}

type Stats = { buyVolume: number; sellVolume: number; tradeCount: number; avgSize: number }

const TradesStats = ({ stats }: Props) => {
  
const total =useMemo (() => (stats?.buyVolume ?? 0) + (stats?.sellVolume ?? 0), [stats]);
const buyPct = total > 0 ? ((stats?.buyVolume ?? 0) / total) * 100 : 50;
  return (
    <div className="border-b border-border bg-muted/40 px-4 py-3">
      <div className="grid grid-cols-3 gap-4 text-xs">
        <Stat label="1m Volume">
          <span className="text-buy">{formatVolume(stats?.buyVolume ?? 0)} buy</span>{' '}
          <span className="text-sell">{formatVolume(stats?.sellVolume ?? 0)} sell</span>
        </Stat>
        <Stat label="1m Trades" align="center">
          <span className="text-base font-semibold tabular-nums">{formatCount(stats?.tradeCount ?? 0)}</span>
        </Stat>
        <Stat label="Avg Size" align="right">
          <span className="text-base font-semibold tabular-nums">{formatSize(stats?.avgSize ?? 0)} BTC</span>
        </Stat>
      </div>
      <div className="mt-2 flex h-1 overflow-hidden rounded-full bg-muted">
        <div className="bg-buy" style={{ width: `${buyPct}%` }} />
        <div className="bg-sell" style={{ width: `${100 - buyPct}%` }} />
      </div>
    </div>
  );
};

export default memo(TradesStats);

interface StatProps {
  label: string;
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
}

function Stat({ label, align = 'left', children }: StatProps) {
  const alignClass =
    align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
  return (
    <div className={alignClass}>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 tabular-nums">{children}</div>
    </div>
  );
}
