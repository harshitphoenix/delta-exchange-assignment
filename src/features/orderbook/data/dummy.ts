import type { OrderBookSnapshot } from '../types';

export const DUMMY_BOOK: OrderBookSnapshot = {
  symbol: 'ETHUSD',
  asks: [
    { price: 62380.0, size: 0.521, total: 12.45 },
    { price: 62375.5, size: 0.893, total: 11.93 },
    { price: 62371.0, size: 1.204, total: 11.04 },
    { price: 62368.0, size: 0.432, total: 9.84 },
    { price: 62365.5, size: 2.109, total: 9.4 },
    { price: 62360.0, size: 0.756, total: 7.29 },
    { price: 62356.5, size: 1.543, total: 6.54 },
    { price: 62352.0, size: 0.891, total: 5.0 },
    { price: 62349.0, size: 1.672, total: 4.1 },
    { price: 62346.5, size: 2.432, total: 2.43 },
  ],
  bids: [
    { price: 62341.0, size: 1.892, total: 1.89 },
    { price: 62338.5, size: 0.763, total: 2.66 },
    { price: 62335.0, size: 1.345, total: 4.0 },
    { price: 62332.0, size: 2.108, total: 6.11 },
    { price: 62328.5, size: 0.534, total: 6.64 },
    { price: 62325.0, size: 1.756, total: 8.4 },
    { price: 62321.5, size: 0.987, total: 9.39 },
    { price: 62318.0, size: 1.432, total: 10.82 },
    { price: 62314.5, size: 0.678, total: 11.5 },
    { price: 62311.0, size: 1.205, total: 12.7 },
  ],
  mid: 62343.75,
  spread: 5.5,
  spreadBps: 8.8,
  imbalance: 1.18,
};
