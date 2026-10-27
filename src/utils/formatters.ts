export function formatKcal(val: number): string {
  return `${Math.round(val).toLocaleString()} kcal`;
}

export function formatGrams(val: number): string {
  return `${Number(val.toFixed(1))}g`;
}

export function formatMg(val: number): string {
  return `${Math.round(val).toLocaleString()} mg`;
}

export function formatPercent(val: number): string {
  return `${Math.round(val)}%`;
}

export function formatSteps(val: number): string {
  return val.toLocaleString();
}
