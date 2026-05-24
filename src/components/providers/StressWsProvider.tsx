import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { StressWsClient } from '@/lib/stress-ws/client';
import { updateConnection } from '@/lib/stores/connection/connection.actions';

const WsClientContext = createContext<StressWsClient | null>(null);

const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8080';

export function StressWsProvider({ children }: { children: ReactNode }) {
  const client = StressWsClient.getInstance();

  useEffect(() => {
    const unsubStatus = client.onStatus(updateConnection);
    client.connect(WS_URL);

    return () => {
      unsubStatus();
      client.disconnect();
    };
  }, [client]);

  return (
    <WsClientContext.Provider value={client}>
      {children}
    </WsClientContext.Provider>
  );
}

export function useWsClient(): StressWsClient {
  const client = useContext(WsClientContext);
  if (!client) throw new Error('useWsClient must be used inside StressWsProvider');
  return client;
}
