import type { Trade } from './types';

export class RingBuffer {
  private readonly data: Trade[] = [];
  private readonly capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  // incoming must be sorted newest-first
  prependMany(incoming: Trade[]): void {
    this.data.unshift(...incoming);
    if (this.data.length > this.capacity) {
      this.data.splice(this.capacity);
    }
  }

  get items(): Trade[] {
    return this.data;
  }

  clear(): void {
    this.data.length = 0;
  }
}
