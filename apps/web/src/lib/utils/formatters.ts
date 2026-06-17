export function formatPopulation(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

export function formatCurrency(n: number, decimals = 0): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: decimals,
    notation: n >= 1_000_000_000 ? "compact" : "standard",
  }).format(n);
}

export function formatPercent(n: number, decimals = 1): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(decimals)}%`;
}

export function formatGDP(billion: number): string {
  if (billion >= 1000) return `$${(billion / 1000).toFixed(1)}T`;
  return `$${billion.toFixed(0)}B`;
}

export function formatScore(score: number): string {
  return score.toFixed(1);
}

export function formatPricePerSqm(usd: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(usd);
}

export function trendColor(change: number): string {
  if (change > 0) return "text-emerald-500";
  if (change < 0) return "text-rose-500";
  return "text-slate-400";
}

export function trendBg(change: number, higherIsBetter = true): string {
  const positive = higherIsBetter ? change > 0 : change < 0;
  if (positive) return "metric-positive";
  if (!positive && change !== 0) return "metric-negative";
  return "metric-neutral";
}
