"use client";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { HousingData } from "@/types/city";

interface Props {
  data: HousingData[];
  cityName: string;
}

interface TooltipPayload {
  value: number;
  name: string;
  color: string;
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
    <div className="glass-card rounded-xl px-3 py-2 text-sm shadow-xl space-y-1">
      <p className="font-semibold">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="text-xs">
          {p.name}: <span className="font-medium">{typeof p.value === "number" && p.value > 100 ? `$${p.value.toLocaleString()}` : `${p.value}x`}</span>
        </p>
      ))}
    </div>
  );
}

export default function HousingPriceChart({ data, cityName }: Props) {
  const chartData = data.map((d) => ({
    year: d.year.toString(),
    "Price/m²": d.avgPricePerSqm,
    "Price-Income": d.priceToIncomeRatio,
  }));

  return (
    <div className="w-full">
      <h4 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
        {cityName} Housing Prices 2014–2024
      </h4>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="houseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} vertical={false} />
          <XAxis dataKey="year" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="left" tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
          <Bar yAxisId="left" dataKey="Price/m²" fill="url(#houseGradient)" stroke="#f59e0b" strokeWidth={1} radius={[3, 3, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="Price-Income" stroke="#f43f5e" strokeWidth={2} dot={{ fill: "#f43f5e", r: 3 }} activeDot={{ r: 5 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
