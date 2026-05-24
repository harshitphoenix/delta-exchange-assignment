import { create } from 'zustand';
import type { ConnectionStatus } from '@/lib/stress-ws/types';

export interface ConnectionState {
  status: ConnectionStatus;
  channelCount: number;
  wsUrl: string;
}

export const useConnectionStore = create<ConnectionState>()(() => ({
  status: 'disconnected',
  channelCount: 0,
  wsUrl: '',
}));
