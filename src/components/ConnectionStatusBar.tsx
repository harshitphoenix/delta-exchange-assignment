import { useConnectionStore } from '@/lib/stores/connection/connection.store';

const CONFIG: Record<
  string,
  { dot: string; label: string; text: string }
> = {
  connected:    { dot: 'bg-buy',  label: 'Connected',      text: 'text-buy'  },
  reconnecting: { dot: 'bg-live', label: 'Reconnecting…',  text: 'text-live' },
  connecting:   { dot: 'bg-live', label: 'Connecting…',    text: 'text-live' },
  disconnected: { dot: 'bg-sell', label: 'Disconnected',   text: 'text-sell' },
};

export function ConnectionStatusBar() {
  const { status, channelCount, wsUrl } = useConnectionStore();
  const cfg = CONFIG[status] ?? CONFIG.disconnected;
  const isConnected = status === 'connected';

  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-xs text-muted-foreground">
      <span className={`relative flex h-2 w-2 shrink-0`}>
        {isConnected && (
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${cfg.dot} opacity-60`} />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${cfg.dot}`} />
      </span>
      <span className={`font-medium ${cfg.text}`}>{cfg.label}</span>
      {isConnected && channelCount > 0 && (
        <>
          <span className="text-border">·</span>
          <span>{channelCount} channels</span>
        </>
      )}
      {wsUrl && (
        <>
          <span className="text-border">·</span>
          <span className="font-mono">{wsUrl}</span>
        </>
      )}
    </div>
  );
}
