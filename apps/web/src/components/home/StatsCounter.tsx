"use client";
import { useInView } from "react-intersection-observer";
import CountUp from "react-countup";
import { motion } from "framer-motion";
import { TrendingDown, TrendingUp, Users, Home, DollarSign, Map } from "lucide-react";

const STATS = [
  {
    icon: Users,
    value: 1.3,
    suffix: "B",
    label: "People in Tracked Cities",
    sub: "Across 10 Asian megacities",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    decimals: 1,
  },
  {
    icon: TrendingDown,
    value: 0.72,
    suffix: "",
    prefix: "",
    label: "Lowest Fertility Rate",
    sub: "Seoul, South Korea (2024)",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    decimals: 2,
  },
  {
    icon: Home,
    value: 18.2,
    suffix: "x",
    label: "Highest Price-to-Income",
    sub: "Seoul housing affordability",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    decimals: 1,
  },
  {
    icon: DollarSign,
    value: 2100,
    suffix: "B",
    prefix: "$",
    label: "Tokyo Metro GDP",
    sub: "Largest urban economy tracked",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    decimals: 0,
  },
  {
    icon: Map,
    value: 40,
    suffix: " yrs",
    label: "Shenzhen's Growth Span",
    sub: "Fishing village to megacity",
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    decimals: 0,
  },
  {
    icon: TrendingUp,
    value: 84.3,
    suffix: " yrs",
    label: "Tokyo Life Expectancy",
    sub: "Highest among tracked cities",
    color: "text-teal-500",
    bg: "bg-teal-500/10",
    decimals: 1,
  },
];

export default function StatsCounter() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

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
            Asia's Urban Transformation
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Key indicators reveal how dramatically Asia's cities are changing —
            from record-low birth rates to explosive economic growth.
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="glass-card rounded-2xl p-6 group hover:shadow-lg transition-shadow duration-300"
            >
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${stat.bg} mb-4`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
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
          ))}
        </div>
      </div>
    </section>
  );
}
