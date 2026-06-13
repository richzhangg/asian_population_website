"use client";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import type { ComparisonMatrix } from "@/types/city";

// One distinct color per city slot
const CITY_COLORS = ["#6366f1", "#f43f5e", "#14b8a6", "#f59e0b"];

interface Props {
  matrix: ComparisonMatrix;
}

// ── Radar chart — transformation scores ──────────────────────────────────────

const SCORE_KEYS = [
  { label: "Housing\nPressure", dataKey: "housingPressureScore" },
  { label: "Aging\nSeverity", dataKey: "agingSeverityScore" },
  { label: "Economic\nDynamism", dataKey: "economicDynamismScore" },
  { label: "Migration\nPressure", dataKey: "migrationPressureScore" },
  { label: "Overall\nTransformation", dataKey: "overallTransformationScore" },
];

function RadarComparison({ matrix }: Props) {
  const { cities } = matrix;

  // Build one row per score axis: { subject, CityA, CityB, ... }
  const radarData = SCORE_KEYS.map(({ label, dataKey }) => {
    const row: Record<string, string | number> = { subject: label };
    cities.forEach((city) => {
      const scoreRow = matrix.rows.find((r) => r.metric.key === dataKey);
      row[city.name] = scoreRow?.values[city.slug] ?? 0;
    });
    return row;
  });

  // Fall back: build from mock scores if rows don't have score keys
  const { MOCK_DASHBOARDS } = require("@/lib/data/mockCities");
  const radarDataFallback = SCORE_KEYS.map(({ label, dataKey }) => {
    const row: Record<string, string | number> = { subject: label };
    cities.forEach((city) => {
      const dash = MOCK_DASHBOARDS[city.slug];
      const scoreKey = dataKey as keyof typeof dash.scores;
      row[city.name] = dash?.scores?.[scoreKey] ?? 0;
    });
    return row;
  });

  const data = radarDataFallback;

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="font-semibold mb-1">Transformation Score Radar</h3>
      <p className="text-xs text-muted-foreground mb-5">
        Scores out of 100 — higher means more pressure / dynamism in that dimension.
      </p>
      <ResponsiveContainer width="100%" height={460}>
        <RadarChart data={data} margin={{ top: 64, right: 110, bottom: 64, left: 110 }} outerRadius="50%">
          <PolarGrid stroke="hsl(var(--border))" strokeOpacity={0.6} />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))", fontWeight: 500 }}
            tickLine={false}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
            tickCount={4}
          />
          {cities.map((city, i) => (
            <Radar
              key={city.slug}
              name={city.name}
              dataKey={city.name}
              stroke={CITY_COLORS[i]}
              fill={CITY_COLORS[i]}
              fillOpacity={0.12}
              strokeWidth={2}
              dot={{ r: 3, fill: CITY_COLORS[i] }}
            />
          ))}
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "12px",
              fontSize: "12px",
            }}
            formatter={(value: number, name: string) => [`${value}/100`, name]}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Grouped bar charts for key numeric metrics ────────────────────────────────

const BAR_METRICS = [
  {
    title: "Price-to-Income Ratio",
    subtitle: "Times annual income needed to buy a home (lower = more affordable)",
    metricKey: "priceToIncomeRatio",
    unit: "x",
    color: CITY_COLORS,
    higherIsBetter: false,
  },
  {
    title: "GDP per Capita (USD)",
    subtitle: "Annual economic output per resident",
    metricKey: "gdpPerCapitaUsd",
    unit: "$",
    color: CITY_COLORS,
    higherIsBetter: true,
  },
  {
    title: "Population Growth Rate",
    subtitle: "Annual change in total population (%/yr)",
    metricKey: "growthRate",
    unit: "%",
    color: CITY_COLORS,
    higherIsBetter: true,
  },
  {
    title: "Median Age",
    subtitle: "Years — reflects aging trajectory",
    metricKey: "medianAge",
    unit: " yrs",
    color: CITY_COLORS,
    higherIsBetter: false,
  },
];

const METRIC_SOURCE: Record<string, (dash: ReturnType<typeof getDash>) => number> = {
  priceToIncomeRatio: (d) => d?.latestHousing?.priceToIncomeRatio ?? 0,
  gdpPerCapitaUsd: (d) => d?.latestEconomic?.gdpPerCapitaUsd ?? 0,
  growthRate: (d) => d?.latestPopulation?.growthRate ?? 0,
  medianAge: (d) => d?.latestDemographics?.medianAge ?? 0,
};

function getDash(slug: string) {
  const { MOCK_DASHBOARDS } = require("@/lib/data/mockCities");
  return MOCK_DASHBOARDS[slug];
}

function formatBarValue(value: number, unit: string): string {
  if (unit === "$") return `$${value.toLocaleString()}`;
  if (unit === "%") return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
  return `${value.toFixed(1)}${unit}`;
}

function GroupedBarCharts({ matrix }: Props) {
  const { cities } = matrix;

  return (
    <div className="grid md:grid-cols-2 gap-5">
      {BAR_METRICS.map(({ title, subtitle, metricKey, unit }) => {
        const chartData = cities.map((city, i) => ({
          city: city.name,
          value: METRIC_SOURCE[metricKey](getDash(city.slug)),
          fill: CITY_COLORS[i],
        }));

        return (
          <div key={metricKey} className="glass-card rounded-2xl p-5">
            <h4 className="font-semibold text-sm mb-0.5">{title}</h4>
            <p className="text-xs text-muted-foreground mb-4">{subtitle}</p>
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
                  tickFormatter={(v: number) =>
                    unit === "$"
                      ? `$${(v / 1000).toFixed(0)}k`
                      : `${v.toFixed(0)}${unit}`
                  }
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [
                    formatBarValue(value, unit),
                    title,
                  ]}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={48}>
                  {chartData.map((entry) => (
                    <Cell key={entry.city} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {/* City color legend */}
            <div className="flex gap-3 flex-wrap mt-3">
              {chartData.map((d) => (
                <div key={d.city} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: d.fill }} />
                  {d.city}
                  <span className="font-semibold text-foreground ml-0.5">
                    {formatBarValue(d.value, unit)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function ComparisonCharts({ matrix }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-5"
    >
      <RadarComparison matrix={matrix} />
      <GroupedBarCharts matrix={matrix} />
    </motion.div>
  );
}
