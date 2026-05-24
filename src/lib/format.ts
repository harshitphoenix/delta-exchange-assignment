const PRICE_FORMATTER = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const SIZE_FORMATTER = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});

const TOTAL_FORMATTER = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const VOLUME_FORMATTER = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const COUNT_FORMATTER = new Intl.NumberFormat('en-US');

export function formatPrice(value: number): string {
  return PRICE_FORMATTER.format(value);
}

export function formatSize(value: number): string {
  return SIZE_FORMATTER.format(value);
}

export function formatTotal(value: number): string {
  return TOTAL_FORMATTER.format(value);
}

export function formatVolume(value: number): string {
  return VOLUME_FORMATTER.format(value);
}

export function formatCount(value: number): string {
  return COUNT_FORMATTER.format(value);
}
