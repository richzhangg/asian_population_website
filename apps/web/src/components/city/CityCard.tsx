"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingDown, TrendingUp, GitCompareArrows } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useComparisonStore } from "@/lib/store/comparisonStore";
import { MOCK_DASHBOARDS } from "@/lib/data/mockCities";
import { formatPopulation, formatCurrency } from "@/lib/utils/formatters";
import type { City } from "@/types/city";
import { cn } from "@/lib/utils/cn";

interface Props {
  city: City;
  index?: number;
}

export default function CityCard({ city, index = 0 }: Props) {
  const { add, remove, isSelected, isFull } = useComparisonStore();
  const dashboard = MOCK_DASHBOARDS[city.slug];
  const selected = isSelected(city.slug);

  const pop = dashboard?.latestPopulation;
  const econ = dashboard?.latestEconomic;
  const scores = dashboard?.scores;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <Link href={`/cities/${city.slug}`} className="block group">
        <div
          className={cn(
            "glass-card rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1",
            selected && "ring-2 ring-primary"
          )}
        >
          {/* Image */}
          <div className="relative h-36 overflow-hidden">
            {city.thumbnailUrl ? (
              <Image
                src={city.thumbnailUrl}
                alt={city.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-blue-700" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-1.5">
              {city.isMegacity && (
                <Badge variant="info" className="text-[10px] bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  Megacity
                </Badge>
              )}
              <Badge variant="outline" className="text-[10px] bg-white/20 text-white border-white/30 backdrop-blur-sm">
                Tier {city.cityTier}
              </Badge>
            </div>

            {/* Compare toggle */}
            <button
              onClick={(e) => {
                e.preventDefault();
                selected ? remove(city.slug) : add(city);
              }}
              disabled={!selected && isFull()}
              className={cn(
                "absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                selected
                  ? "bg-primary text-white"
                  : isFull()
                  ? "bg-white/20 text-white/50 cursor-not-allowed"
                  : "bg-white/20 text-white hover:bg-white/40 backdrop-blur-sm"
              )}
            >
              <GitCompareArrows className="w-3.5 h-3.5" />
            </button>

            <div className="absolute bottom-3 left-3">
              <h3 className="text-white font-bold text-lg leading-none">{city.name}</h3>
              <p className="text-white/70 text-xs">{city.country}</p>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3">
            {/* Key metrics */}
            <div className="grid grid-cols-2 gap-3">
              {pop && (
                <div>
                  <p className="text-xs text-muted-foreground">Population</p>
                  <p className="font-bold">{formatPopulation(pop.totalPopulation)}</p>
                  <div className={cn("flex items-center gap-0.5 text-xs mt-0.5", pop.growthRate >= 0 ? "text-emerald-500" : "text-rose-500")}>
                    {pop.growthRate >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {pop.growthRate > 0 ? "+" : ""}{pop.growthRate.toFixed(2)}%/yr
                  </div>
                </div>
              )}
              {econ && (
                <div>
                  <p className="text-xs text-muted-foreground">GDP/Capita</p>
                  <p className="font-bold">{formatCurrency(econ.gdpPerCapitaUsd, 0)}</p>
                  <div className={cn("flex items-center gap-0.5 text-xs mt-0.5", econ.gdpGrowthRate >= 0 ? "text-emerald-500" : "text-rose-500")}>
                    {econ.gdpGrowthRate >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {econ.gdpGrowthRate > 0 ? "+" : ""}{econ.gdpGrowthRate.toFixed(1)}%/yr
                  </div>
                </div>
              )}
            </div>

            {/* Transformation score bar */}
            {scores && (
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Transformation Score</span>
                  <span className="font-semibold text-foreground">{scores.overallTransformationScore}/100</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${scores.overallTransformationScore}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
