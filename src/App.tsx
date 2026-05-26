import { TickerBar } from '@/features/ticker';
import { Trades } from '@/features/trades';
import { OrderBook } from './features/orderbook';
import { stressWsClient } from './lib/stress-ws/client';
import { useEffect } from 'react';
import { updateConnection } from './lib/stores/connection/connection.actions';
import { cancelPendingFlush } from './lib/stress-ws/batcher';

const WS_URL = 'ws://localhost:8080';
function App() {
  useEffect(() => {
    const client = stressWsClient;
    const unsubStatus = client.onStatus(updateConnection);
    client.connect(WS_URL);

    return () => {
      unsubStatus();
      cancelPendingFlush();
      client.disconnect();
    };
  }, []);
  return (
      <div className="flex min-h-screen flex-col gap-4 bg-background p-4 text-foreground">
        <TickerBar />
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-2">
          <OrderBook />
          <Trades />
        </div>
      </div>
  );
}

export default App;
