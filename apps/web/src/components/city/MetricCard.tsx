"use client";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  color?: "blue" | "emerald" | "rose" | "amber" | "indigo" | "teal";
  higherIsBetter?: boolean;
  className?: string;
}

const colorMap = {
  blue: { bg: "bg-blue-500/10", icon: "text-blue-500", ring: "ring-blue-500/20" },
  emerald: { bg: "bg-emerald-500/10", icon: "text-emerald-500", ring: "ring-emerald-500/20" },
  rose: { bg: "bg-rose-500/10", icon: "text-rose-500", ring: "ring-rose-500/20" },
  amber: { bg: "bg-amber-500/10", icon: "text-amber-500", ring: "ring-amber-500/20" },
  indigo: { bg: "bg-indigo-500/10", icon: "text-indigo-500", ring: "ring-indigo-500/20" },
  teal: { bg: "bg-teal-500/10", icon: "text-teal-500", ring: "ring-teal-500/20" },
};

export default function MetricCard({
  label,
  value,
  change,
  changeLabel,
  icon: Icon,
  color = "blue",
  higherIsBetter = true,
  className,
}: Props) {
  const colors = colorMap[color];

  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isBetter =
    change !== undefined && (higherIsBetter ? isPositive : isNegative);

  const trendColor = isBetter
    ? "text-emerald-500"
    : change !== undefined && change !== 0
    ? "text-rose-500"
    : "text-muted-foreground";

  return (
    <div
      className={cn(
        "glass-card rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow",
        className
      )}
    >
      <div className="flex items-center justify-between">
        {Icon && (
          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", colors.bg)}>
            <Icon className={cn("w-4 h-4", colors.icon)} />
          </div>
        )}
        {change !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold",
              isBetter
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                : change !== 0
                ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                : "bg-muted text-muted-foreground"
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : isNegative ? (
              <TrendingDown className="w-3 h-3" />
            ) : (
              <Minus className="w-3 h-3" />
            )}
            {change > 0 ? "+" : ""}
            {change.toFixed(2)}
            {changeLabel ? ` ${changeLabel}` : ""}
          </div>
        )}
      </div>

      <div>
        <p className="text-2xl font-bold tabular-nums">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}
