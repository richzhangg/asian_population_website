"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BarChart3, Bot, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TypeAnimation } from "react-type-animation";
import type { WorldBankHeroStat } from "@/types/worldbank";

interface Props {
  stats?: WorldBankHeroStat[];
}

// Fallback stats shown when WB data is unavailable
const FALLBACK_STATS: WorldBankHeroStat[] = [
  { label: "Japan Population", value: "124M" },
  { label: "South Korea Urban %", value: "81.4%" },
  { label: "China Population", value: "1.41B" },
  { label: "Hong Kong Density", value: "7,140/km²" },
];

const CARD_POSITIONS = [
  "left-4 top-1/4",
  "right-4 top-1/3",
  "left-8 bottom-1/3",
  "right-8 bottom-1/4",
];

const CARD_GRADIENTS = [
  "from-blue-500 to-indigo-600",
  "from-teal-500 to-emerald-500",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-500",
];

export default function Hero({ stats }: Props) {
  const floatingStats = stats?.length ? stats : FALLBACK_STATS;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-mesh-gradient">
      {/* Animated background grid */}
      <div
        className="absolute inset-0 opacity-30 dark:opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,102,241,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.15) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-radial from-blue-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Floating live data cards */}
      {floatingStats.map((stat, i) => (
        <motion.div
          key={stat.label}
          className={`absolute hidden lg:block ${CARD_POSITIONS[i]} z-10`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 + i * 0.15, duration: 0.6 }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
            className="glass-card rounded-xl px-4 py-3 shadow-lg"
          >
            <p className="text-[10px] text-muted-foreground mb-0.5">
              {stat.label}
            </p>
            <p
              className={`text-xl font-bold bg-gradient-to-r ${CARD_GRADIENTS[i]} bg-clip-text text-transparent`}
            >
              {stat.value}
            </p>
          </motion.div>
        </motion.div>
      ))}

      {/* Main content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Pill badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary font-medium mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Live World Bank Data · Updated Daily
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-6"
        >
          How{" "}
          <span className="gradient-text">
            <TypeAnimation
              sequence={[
                "Population",
                2000,
                "Demographics",
                2000,
                "Migration",
                2000,
                "Aging",
                2000,
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
            />
          </span>
          <br />
          Transforms Asian Cities
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          The Asian Urban Transformation Matrix tracks population, density, and
          urbanization across Asia&apos;s most dynamic cities — powered by live
          World Bank Open Data.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link href="/cities">
            <Button variant="gradient" size="xl" className="w-full sm:w-auto">
              <Globe className="w-4 h-4" />
              Explore Cities
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>

        {/* Trust bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6 text-xs text-muted-foreground"
        >
          {[
            { icon: Globe, label: "4 Live Economies" },
            { icon: BarChart3, label: "4 WB Indicators" },
            { icon: Bot, label: "World Bank API" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <Icon className="w-3.5 h-3.5 text-primary/70" />
              <span>{label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
