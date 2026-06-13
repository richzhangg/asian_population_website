"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { EconomicData } from "@/types/city";
import { formatGDP } from "@/lib/utils/formatters";

interface Props {
  data: EconomicData[];
  cityName: string;
}

export default function GDPChart({ data, cityName }: Props) {
  const chartData = data.map((d) => ({
    year: d.year.toString(),
    gdp: d.gdpUsdBillion,
    growth: d.gdpGrowthRate,
    perCapita: d.gdpPerCapitaUsd,
  }));

  return (
    <div className="w-full">
      <h4 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
        {cityName} Economic Output 2014–2024
      </h4>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="gdpGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} vertical={false} />
          <XAxis dataKey="year" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
          <YAxis
            yAxisId="left"
            tickFormatter={(v: number) => formatGDP(v)}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(v: number) => `${v}%`}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "12px",
              fontSize: "12px",
            }}
            formatter={(value: number, name: string) =>
              name === "gdp"
                ? [formatGDP(value), "GDP"]
                : name === "growth"
                ? [`${value > 0 ? "+" : ""}${value.toFixed(1)}%`, "Growth"]
                : [`$${value.toLocaleString()}`, "GDP/Capita"]
            }
          />
          <ReferenceLine yAxisId="right" y={0} stroke="hsl(var(--border))" strokeDasharray="4 4" />
          <Line yAxisId="left" type="monotone" dataKey="gdp" stroke="url(#gdpGrad)" strokeWidth={2.5} dot={{ fill: "#14b8a6", r: 3 }} activeDot={{ r: 5 }} />
          <Line yAxisId="right" type="monotone" dataKey="growth" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5 3" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
