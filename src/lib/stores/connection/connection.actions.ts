import { useConnectionStore } from './connection.store';
import type { StatusUpdate } from '@/lib/stress-ws/types';

export const updateConnection = (payload: StatusUpdate): void => {
  useConnectionStore.setState(payload);
};
