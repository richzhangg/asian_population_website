"use client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { PopulationData } from "@/types/city";
import { formatPopulation } from "@/lib/utils/formatters";

interface Props {
  data: PopulationData[];
  cityName: string;
}

interface TooltipPayload {
  value: number;
  dataKey: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card rounded-xl px-3 py-2 text-sm shadow-xl">
      <p className="font-semibold mb-1">{label}</p>
      <p className="text-muted-foreground">
        Population:{" "}
        <span className="text-foreground font-medium">
          {formatPopulation(payload[0]?.value ?? 0)}
        </span>
      </p>
      {payload[1] && (
        <p className="text-muted-foreground">
          Growth:{" "}
          <span
            className={`font-medium ${payload[1].value >= 0 ? "text-emerald-500" : "text-rose-500"}`}
          >
            {payload[1].value > 0 ? "+" : ""}
            {payload[1].value.toFixed(2)}%/yr
          </span>
        </p>
      )}
    </div>
  );
}

export default function PopulationTrendChart({ data, cityName }: Props) {
  const chartData = data.map((d) => ({
    year: d.year.toString(),
    population: d.totalPopulation,
    growthRate: d.growthRate,
  }));

  return (
    <div className="w-full">
      <h4 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
        {cityName} Population 2014–2024
      </h4>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="popGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} vertical={false} />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v: number) => formatPopulation(v)}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="hsl(var(--border))" />
          <Area
            type="monotone"
            dataKey="population"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#popGradient)"
            dot={{ fill: "#6366f1", strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5, fill: "#6366f1" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
