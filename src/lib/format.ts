export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyMonthly(amount: number): string {
  return `${formatCurrency(amount)}/mo`;
}

export function formatDistanceMiles(km: number | null | undefined): string {
  if (km == null) return '';
  const miles = km / 1.60934;
  return `${miles < 10 ? miles.toFixed(1) : Math.round(miles)} mi`;
}

export function milesToKm(miles: number): number {
  return miles * 1.60934;
}
