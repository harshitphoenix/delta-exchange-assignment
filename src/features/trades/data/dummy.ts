import type { RollingStats, Trade } from '../types';

export const DUMMY_TRADES: Trade[] = [
  { id: 't1', time: '14:32:05.234', price: 62341.5, size: 0.125, side: 'buy' },
  { id: 't2', time: '14:32:04.891', price: 62340.0, size: 0.893, side: 'sell', aggregatedCount: 3, isLarge: true },
  { id: 't3', time: '14:32:04.567', price: 62341.5, size: 0.034, side: 'buy' },
  { id: 't4', time: '14:32:03.123', price: 62342.0, size: 0.567, side: 'buy' },
  { id: 't5', time: '14:32:02.789', price: 62339.5, size: 1.234, side: 'sell', aggregatedCount: 5, isLarge: true },
  { id: 't6', time: '14:32:01.456', price: 62340.0, size: 0.089, side: 'sell' },
  { id: 't7', time: '14:32:00.123', price: 62341.0, size: 0.456, side: 'buy' },
  { id: 't8', time: '14:31:59.890', price: 62338.0, size: 0.234, side: 'sell' },
  { id: 't9', time: '14:31:58.567', price: 62340.5, size: 0.178, side: 'buy' },
  { id: 't10', time: '14:31:57.234', price: 62337.5, size: 0.567, side: 'sell' },
  { id: 't11', time: '14:31:56.001', price: 62339.5, size: 0.312, side: 'sell' },
  { id: 't12', time: '14:31:55.443', price: 62340.5, size: 0.098, side: 'buy' },
  { id: 't13', time: '14:31:54.221', price: 62336.0, size: 0.445, side: 'sell' },
];

export const DUMMY_STATS: RollingStats = {
  buyVolume: 12.3,
  sellVolume: 8.7,
  tradeCount: 847,
  avgSize: 0.025,
};
