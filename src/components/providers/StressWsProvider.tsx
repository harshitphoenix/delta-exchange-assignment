import { useEffect, type ReactNode } from 'react';
import { StressWsClient } from '@/lib/stress-ws/client';
import { updateConnection } from '@/lib/stores/connection/connection.actions';
import { cancelPendingFlush } from '@/lib/stress-ws/batcher';


const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8080';

export function StressWsProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const client = StressWsClient.getInstance();

    const unsubStatus = client.onStatus(updateConnection);
    client.connect(WS_URL);

    return () => {
      unsubStatus();
      cancelPendingFlush();
      client.disconnect();
    };
  }, []);

  return children;
}
