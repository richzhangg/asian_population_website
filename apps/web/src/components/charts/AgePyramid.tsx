"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { DemographicData } from "@/types/city";

interface Props {
  data: DemographicData;
  cityName: string;
}

const AGE_COLORS = {
  "0–14": "#10b981",
  "15–24": "#0ea5e9",
  "25–64": "#6366f1",
  "65+": "#f59e0b",
};

export default function AgePyramid({ data, cityName }: Props) {
  const cohorts = [
    { name: "0–14", value: data.age0to14, color: AGE_COLORS["0–14"] },
    { name: "15–24", value: data.age15to24, color: AGE_COLORS["15–24"] },
    { name: "25–64", value: data.age25to64, color: AGE_COLORS["25–64"] },
    { name: "65+", value: data.age65plus, color: AGE_COLORS["65+"] },
  ];

  return (
    <div className="w-full">
      <h4 className="text-sm font-semibold mb-1 text-muted-foreground uppercase tracking-wide">
        {cityName} Age Structure
      </h4>
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <span className="text-xs text-muted-foreground">
          Median age: <strong>{data.medianAge}</strong>
        </span>
        <span className="text-xs text-muted-foreground">
          Fertility: <strong>{data.fertilityRate}</strong>
        </span>
        <span className="text-xs text-muted-foreground">
          Life exp: <strong>{data.lifeExpectancy}</strong>
        </span>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={cohorts}
          layout="vertical"
          margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 70]}
            tickFormatter={(v: number) => `${v}%`}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12, fill: "hsl(var(--foreground))", fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            formatter={(value: number) => [`${value.toFixed(1)}%`, "Share"]}
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "12px",
              fontSize: "12px",
            }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={28}>
            {cohorts.map((entry) => (
              <Cell key={entry.name} fill={entry.color} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex gap-3 flex-wrap mt-2">
        {cohorts.map((c) => (
          <div key={c.name} className="flex items-center gap-1.5 text-xs">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: c.color }} />
            <span className="text-muted-foreground">{c.name}</span>
            <span className="font-semibold">{c.value.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
