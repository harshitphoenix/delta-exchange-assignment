import { OrderBook } from '@/features/orderbook';
import { Trades } from '@/features/trades';

function App() {
  return (
    <div className="min-h-screen bg-background p-4 text-foreground">
      <div className="grid h-[calc(100vh-2rem)] grid-cols-1 gap-4 lg:grid-cols-2">
        <OrderBook />
        <Trades />
      </div>
    </div>
  );
}

export default App;
