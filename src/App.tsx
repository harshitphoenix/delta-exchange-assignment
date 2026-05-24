import { OrderBook } from '@/features/orderbook';
import { TickerBar } from '@/features/ticker';
import { Trades } from '@/features/trades';

function App() {
  return (
    <div className="flex min-h-screen flex-col gap-4 bg-background p-4 text-foreground">
      <TickerBar />
      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-2">
        <OrderBook />
        <Trades />
      </div>
    </div>
  );
}

export default App;
