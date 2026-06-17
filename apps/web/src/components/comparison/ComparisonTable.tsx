"use client";
import { Fragment } from "react";
import { motion } from "framer-motion";
import { Trophy, AlertCircle, Minus } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ComparisonMatrix, ComparisonRow } from "@/types/city";

interface Props {
  matrix: ComparisonMatrix;
}

function fmtLarge(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}

function formatValue(value: number | null, format: string, metricKey?: string): string {
  if (value === null) return "–";
  if (metricKey === "gdp") return fmtLarge(value);
  if (metricKey === "gdpPerCapita") return `$${Math.round(value).toLocaleString()}`;
  switch (format) {
    case "percentage":
      return `${value.toFixed(2)}%`;
    case "currency":
      return `$${value.toLocaleString()}`;
    case "score":
      return `${value}/100`;
    case "number":
    default:
      return typeof value === "number" ? value.toFixed(1) : String(value);
  }
}

function CellValue({
  row,
  slug,
}: {
  row: ComparisonRow;
  slug: string;
}) {
  const val = row.values[slug];
  const isBest = row.best === slug;
  const isWorst = row.worst === slug && slug !== row.best;

  return (
    <td
      className={cn(
        "px-4 py-4 text-center text-sm font-semibold tabular-nums transition-colors",
        isBest && "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400",
        isWorst && "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400"
      )}
    >
      <div className="flex items-center justify-center gap-1.5">
        {isBest && <Trophy className="w-3 h-3 text-emerald-500" />}
        {isWorst && <AlertCircle className="w-3 h-3 text-rose-400" />}
        {val === null ? <Minus className="w-3 h-3 text-muted-foreground" /> : formatValue(val, row.metric.format, row.metric.key)}
      </div>
    </td>
  );
}

const ECONOMIC_KEYS = new Set(["gdp", "gdpPerCapita", "gdpGrowth", "unemployment", "inflation"]);

export default function ComparisonTable({ matrix }: Props) {
  const { cities, rows } = matrix;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border/60">
              <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground w-48">
                Metric
              </th>
              {cities.map((city) => (
                <th key={city.slug} className="px-4 py-4 text-center min-w-[120px]">
                  <div>
                    <p className="font-bold text-sm">{city.name}</p>
                    <p className="text-xs text-muted-foreground">{city.country}</p>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {rows.map((row, i) => {
              const isFirstEcon = ECONOMIC_KEYS.has(row.metric.key) && !ECONOMIC_KEYS.has(rows[i - 1]?.metric.key ?? "");
              return (
                <Fragment key={row.metric.key}>
                  {isFirstEcon && (
                    <tr key="econ-header" className="bg-muted/20">
                      <td
                        colSpan={cities.length + 1}
                        className="px-4 py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground border-t border-border"
                      >
                        Economics
                      </td>
                    </tr>
                  )}
                  {i === 0 && (
                    <tr key="pop-header" className="bg-muted/20">
                      <td
                        colSpan={cities.length + 1}
                        className="px-4 py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
                      >
                        Population
                      </td>
                    </tr>
                  )}
                  <tr
                    className={cn(
                      "hover:bg-muted/30 transition-colors",
                      i % 2 === 0 ? "bg-background/50" : "bg-muted/10"
                    )}
                  >
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium">{row.metric.label}</p>
                      <p className="text-xs text-muted-foreground">{row.metric.unit}</p>
                    </td>
                    {cities.map((city) => (
                      <CellValue key={city.slug} row={row} slug={city.slug} />
                    ))}
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="px-4 py-3 border-t border-border/40 flex items-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Trophy className="w-3 h-3 text-emerald-500" />
          <span>Best in category</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AlertCircle className="w-3 h-3 text-rose-400" />
          <span>Worst in category</span>
        </div>
      </div>
    </motion.div>
  );
}
