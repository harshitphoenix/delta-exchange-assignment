import type { ChannelName, ConnectionStatus, MessageHandler, StatusHandler, StatusUpdate } from './types';

const MAX_BACKOFF_MS = 30_000;

export class StressWsClient {
  private static _instance: StressWsClient | null = null;

  static getInstance(): StressWsClient {
    StressWsClient._instance ??= new StressWsClient();
    return StressWsClient._instance;
  }

  private constructor() {}

  private ws: WebSocket | null = null;
  private url = '';
  private attempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private destroyed = false;

  // Source of truth for reconnect replay: channel → set of symbols
  private readonly registry = new Map<ChannelName, Set<string>>();

  // Message demux: message.type → handler set
  private readonly handlers = new Map<string, Set<MessageHandler>>();

  // Connection status listeners (wired to useConnectionStore by StressWsProvider)
  private readonly statusListeners = new Set<StatusHandler>();

  // ── Public API ──────────────────────────────────────────────────────────────

  connect(url: string): void {
    this.clearTimer();
    this.ws?.close();
    this.ws = null;
    this.attempt = 0;
    this.url = url;
    this.destroyed = false;
    this.openSocket();
  }

  disconnect(): void {
    this.destroyed = true;
    this.clearTimer();
    this.ws?.close();
    this.ws = null;
    this.emitStatus('disconnected', 0);
  }

  subscribe(channel: ChannelName, symbols: string[]): void {
    let set = this.registry.get(channel);
    if (!set) {
      set = new Set();
      this.registry.set(channel, set);
    }
    symbols.forEach(s => set!.add(s));
    this.flushSubscription();
  }

  unsubscribe(channel: ChannelName, symbols: string[]): void {
    const set = this.registry.get(channel);
    if (!set) return;
    symbols.forEach(s => set.delete(s));
    if (set.size === 0) this.registry.delete(channel);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({ type: 'unsubscribe', payload: { channels: [{ name: channel, symbols }] } }),
      );
    }
  }

  /** Register a handler for a message type. Returns an unsubscribe function. */
  on(type: string, handler: MessageHandler): () => void {
    let set = this.handlers.get(type);
    if (!set) {
      set = new Set();
      this.handlers.set(type, set);
    }
    set.add(handler);
    return () => this.handlers.get(type)?.delete(handler);
  }

  /** Register a connection status listener. Returns an unsubscribe function. */
  onStatus(handler: StatusHandler): () => void {
    this.statusListeners.add(handler);
    return () => this.statusListeners.delete(handler);
  }

  // ── Private ─────────────────────────────────────────────────────────────────

  private openSocket(): void {
    if (this.destroyed) return;
    this.emitStatus(this.attempt === 0 ? 'connecting' : 'reconnecting', 0);

    const ws = new WebSocket(this.url);
    this.ws = ws;

    ws.onopen = () => {
      if (ws !== this.ws) return;
      this.attempt = 0;
      this.flushSubscription();
    };

    ws.onmessage = ({ data }: MessageEvent) => {
      if (ws !== this.ws) return;
      this.route(data as string);
    };

    ws.onclose = () => {
      if (ws !== this.ws || this.destroyed) return;
      this.scheduleReconnect();
    };

    // onerror always fires before onclose; let onclose drive reconnect
    ws.onerror = () => {};
  }

  private route(raw: string): void {
    let msg: unknown;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }

    if (typeof msg !== 'object' || msg === null || !('type' in msg)) return;

    const type = (msg as Record<string, unknown>).type as string;

    // Backend ack — sync channel count and mark as connected
    if (type === 'subscriptions') {
      const channels =
        (msg as { payload?: { channels?: unknown[] } }).payload?.channels ?? [];
      this.emitStatus('connected', channels.length);
      return;
    }

    this.handlers.get(type)?.forEach(h => h(msg));
  }

  /** Merge registry into one subscribe message and send. Called on open and subscribe(). */
  private flushSubscription(): void {
    if (this.ws?.readyState !== WebSocket.OPEN || !this.registry.size) return;

    const channels: { name: ChannelName; symbols: string[] }[] = [];
    this.registry.forEach((symbols, name) => {
      if (symbols.size) channels.push({ name, symbols: [...symbols] });
    });
    if (!channels.length) return;

    this.ws.send(JSON.stringify({ type: 'subscribe', payload: { channels } }));
  }

  private scheduleReconnect(): void {
    this.clearTimer();
    this.attempt++;
    const base = Math.min(1000 * 2 ** this.attempt, MAX_BACKOFF_MS);
    const delay = base + Math.random() * 0.3 * base; // ±30% jitter
    this.reconnectTimer = setTimeout(() => this.openSocket(), delay);
  }

  private clearTimer(): void {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private emitStatus(status: ConnectionStatus, channelCount: number): void {
    const update: StatusUpdate = { status, channelCount, wsUrl: this.url };
    this.statusListeners.forEach(h => h(update));
  }
}

export const stressWsClient = StressWsClient.getInstance();
