"use client";
import { motion } from "framer-motion";
import { Trophy, AlertCircle, Minus } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ComparisonMatrix, ComparisonRow } from "@/types/city";

interface Props {
  matrix: ComparisonMatrix;
}

function formatValue(value: number | null, format: string): string {
  if (value === null) return "–";
  switch (format) {
    case "percentage":
      return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
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
  const isBest = row.metric.best === slug;
  const isWorst = row.metric.worst === slug && slug !== row.metric.best;

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
        {val === null ? <Minus className="w-3 h-3 text-muted-foreground" /> : formatValue(val, row.metric.format)}
      </div>
    </td>
  );
}

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
            {rows.map((row, i) => (
              <tr
                key={row.metric.key}
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
            ))}
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
