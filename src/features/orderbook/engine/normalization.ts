import type { RawLevel } from './types';

export function applyDelta(map: Map<number, number>, levels: RawLevel[]): void {
  for (const [priceStr, sizeStr] of levels) {
    const price = Number(priceStr);
    const size = Number(sizeStr);
    if (size === 0) {
      map.delete(price);
    } else {
      map.set(price, size);
    }
  }
}
