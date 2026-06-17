"use client";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import type { ComparisonMatrix, ComparisonRow } from "@/types/city";

const CITY_COLORS = ["#6366f1", "#f43f5e", "#14b8a6", "#f59e0b"];

interface Props {
  matrix: ComparisonMatrix;
}

function fmtLarge(n: number | null): string {
  if (n === null) return "—";
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toFixed(1);
}

function fmtGdp(v: number): string {
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  return `$${fmtLarge(v)}`;
}

function yTickFormatter(metricKey: string) {
  return (v: number) => {
    if (metricKey === "totalPopulation" || metricKey === "urbanPopulation") return fmtLarge(v);
    if (metricKey === "urbanPopulationPercent" || metricKey === "gdpGrowth" || metricKey === "unemployment" || metricKey === "inflation") return `${v.toFixed(1)}%`;
    if (metricKey === "gdp") return fmtGdp(v);
    if (metricKey === "gdpPerCapita") return `$${(v / 1000).toFixed(0)}K`;
    return v.toFixed(0);
  };
}

function tooltipFormatter(metricKey: string) {
  return (value: number): [string, string] => {
    let formatted: string;
    if (metricKey === "totalPopulation" || metricKey === "urbanPopulation") formatted = fmtLarge(value);
    else if (metricKey === "urbanPopulationPercent" || metricKey === "gdpGrowth" || metricKey === "unemployment" || metricKey === "inflation") formatted = `${value.toFixed(2)}%`;
    else if (metricKey === "gdp") formatted = fmtGdp(value);
    else if (metricKey === "gdpPerCapita") formatted = `$${Math.round(value).toLocaleString()}`;
    else formatted = value.toFixed(1);
    return [formatted, ""];
  };
}

const POPULATION_KEYS = new Set(["totalPopulation", "populationDensity", "urbanPopulation", "urbanPopulationPercent"]);
const ECONOMIC_KEYS = new Set(["gdp", "gdpPerCapita", "gdpGrowth", "unemployment", "inflation"]);

function MetricBarChart({
  row,
  cities,
}: {
  row: ComparisonRow;
  cities: ComparisonMatrix["cities"];
}) {
  const chartData = cities.map((city, i) => ({
    city: city.name,
    value: row.values[city.slug] ?? 0,
    fill: CITY_COLORS[i % CITY_COLORS.length],
    isBest: city.slug === row.best,
  }));

  return (
    <div className="glass-card rounded-2xl p-5">
      <h4 className="font-semibold text-sm mb-0.5">{row.metric.label}</h4>
      <p className="text-xs text-muted-foreground mb-1 font-mono">
        {row.metric.unit}
      </p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart
          data={chartData}
          margin={{ top: 4, right: 8, left: -8, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            strokeOpacity={0.5}
            vertical={false}
          />
          <XAxis
            dataKey="city"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={yTickFormatter(row.metric.key)}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "12px",
              fontSize: "12px",
            }}
            formatter={tooltipFormatter(row.metric.key)}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={48}>
            {chartData.map((entry) => (
              <Cell key={entry.city} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Per-city value legend */}
      <div className="flex gap-3 flex-wrap mt-3">
        {chartData.map((d) => (
          <div
            key={d.city}
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <span
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ background: d.fill }}
            />
            {d.city}
            <span className="font-semibold text-foreground ml-0.5">
              {yTickFormatter(row.metric.key)(d.value)}
            </span>
            {d.isBest && (
              <span className="text-emerald-500 font-semibold">★</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ComparisonCharts({ matrix }: Props) {
  const { cities, rows } = matrix;
  const populationRows = rows.filter((r) => POPULATION_KEYS.has(r.metric.key));
  const economicRows = rows.filter((r) => ECONOMIC_KEYS.has(r.metric.key));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-8"
    >
      {/* Source note */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full px-2.5 py-1 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live · World Bank Open Data
        </span>
        <span>★ = best value for that metric</span>
      </div>

      {/* Population section */}
      {populationRows.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Population
          </h3>
          <div className="grid md:grid-cols-2 gap-5">
            {populationRows.map((row) => (
              <MetricBarChart key={row.metric.key} row={row} cities={cities} />
            ))}
          </div>
        </div>
      )}

      {/* Economic section */}
      {economicRows.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Economics
          </h3>
          <div className="grid md:grid-cols-2 gap-5">
            {economicRows.map((row) => (
              <MetricBarChart key={row.metric.key} row={row} cities={cities} />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
