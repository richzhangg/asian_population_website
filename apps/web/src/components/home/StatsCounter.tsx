"use client";
import { useInView } from "react-intersection-observer";
import CountUp from "react-countup";
import { motion } from "framer-motion";
import {
  Users,
  Building2,
  Globe,
  MapPin,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import type { WorldBankHomeStat } from "@/types/worldbank";

interface Props {
  stats?: WorldBankHomeStat[];
}

const ICONS = [Users, Building2, Globe, MapPin, TrendingUp, BarChart3];

const COLORS = [
  { color: "text-blue-500", bg: "bg-blue-500/10" },
  { color: "text-teal-500", bg: "bg-teal-500/10" },
  { color: "text-rose-500", bg: "bg-rose-500/10" },
  { color: "text-indigo-500", bg: "bg-indigo-500/10" },
  { color: "text-amber-500", bg: "bg-amber-500/10" },
  { color: "text-emerald-500", bg: "bg-emerald-500/10" },
];

// Shown when WB data fetch fails
const FALLBACK_STATS: WorldBankHomeStat[] = [
  {
    label: "People Across 4 Tracked Economies",
    sub: "Japan · South Korea · China · Hong Kong",
    value: 1.59,
    suffix: "B",
    decimals: 2,
  },
  {
    label: "Hong Kong Urbanization Rate",
    sub: "Most urbanized economy tracked",
    value: 100,
    suffix: "%",
    decimals: 1,
  },
  {
    label: "China Total Population",
    sub: "Largest economy tracked",
    value: 1.41,
    suffix: "B",
    decimals: 2,
  },
  {
    label: "Japan Population Density",
    sub: "People per km² of land area",
    value: 340,
    suffix: "/km²",
    decimals: 0,
  },
  {
    label: "South Korea Urban Population",
    sub: "Share of total population",
    value: 81.4,
    suffix: "%",
    decimals: 1,
  },
  {
    label: "Hong Kong Population Density",
    sub: "People per km² of land area",
    value: 7140,
    suffix: "/km²",
    decimals: 0,
  },
];

export default function StatsCounter({ stats }: Props) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });
  const activeStats = stats?.length ? stats : FALLBACK_STATS;

  return (
    <section ref={ref} className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
            By the Numbers
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Asia&apos;s Urban Transformation
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Key indicators from the World Bank reveal how dramatically Asia&apos;s
            cities are changing — from population density to urbanization rates.
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {activeStats.slice(0, 6).map((stat, i) => {
            const Icon = ICONS[i % ICONS.length];
            const c = COLORS[i % COLORS.length];
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="glass-card rounded-2xl p-6 group hover:shadow-lg transition-shadow duration-300"
              >
                <div
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${c.bg} mb-4`}
                >
                  <Icon className={`w-5 h-5 ${c.color}`} />
                </div>

                <div className="text-3xl sm:text-4xl font-bold tabular-nums mb-1">
                  {stat.prefix ?? ""}
                  {inView ? (
                    <CountUp
                      end={stat.value}
                      duration={2}
                      delay={i * 0.1}
                      decimals={stat.decimals}
                      separator=","
                    />
                  ) : (
                    "0"
                  )}
                  {stat.suffix}
                </div>

                <p className="font-semibold text-sm mb-1">{stat.label}</p>
                <p className="text-xs text-muted-foreground">{stat.sub}</p>
              </motion.div>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Data sourced from{" "}
          <a
            href="https://data.worldbank.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            World Bank Open Data
          </a>{" "}
          · updated every 24 hours
        </p>
      </div>
    </section>
  );
}
