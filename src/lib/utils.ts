import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseTradeTime(timestampUs: number): string {
  return new Date(timestampUs / 1000).toISOString().slice(11, 23);
}