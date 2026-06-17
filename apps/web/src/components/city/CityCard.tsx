"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { GitCompareArrows, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useComparisonStore } from "@/lib/store/comparisonStore";
import { formatPopulation } from "@/lib/utils/formatters";
import type { City } from "@/types/city";
import type { WorldBankCityData } from "@/types/worldbank";
import { cn } from "@/lib/utils/cn";

interface Props {
  city: City;
  index?: number;
  wbData?: WorldBankCityData;
}

export default function CityCard({ city, index = 0, wbData }: Props) {
  const { add, remove, isSelected, isFull } = useComparisonStore();
  const selected = isSelected(city.slug);

  const pop = wbData?.totalPopulation;
  const urban = wbData?.urbanPopulationPercent;

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
                <Badge
                  variant="info"
                  className="text-[10px] bg-white/20 text-white border-white/30 backdrop-blur-sm"
                >
                  Megacity
                </Badge>
              )}
              <Badge
                variant="outline"
                className="text-[10px] bg-white/20 text-white border-white/30 backdrop-blur-sm"
              >
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
              <h3 className="text-white font-bold text-lg leading-none">
                {city.name}
              </h3>
              <p className="text-white/70 text-xs">{city.country}</p>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3">
            {wbData ? (
              /* Live World Bank metrics */
              <div className="grid grid-cols-2 gap-3">
                {pop?.value != null && (
                  <div>
                    <p className="text-xs text-muted-foreground">Population</p>
                    <p className="font-bold tabular-nums">
                      {formatPopulation(pop.value)}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {pop.year} · World Bank
                    </p>
                  </div>
                )}
                {urban?.value != null && (
                  <div>
                    <p className="text-xs text-muted-foreground">Urban %</p>
                    <p className="font-bold tabular-nums">
                      {urban.value.toFixed(1)}%
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {urban.year} · SP.URB.TOTL.IN.ZS
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* No WB data — show city description */
              <p className="text-xs text-muted-foreground line-clamp-2">
                {city.description}
              </p>
            )}

            {/* Live data indicator */}
            <div className="flex items-center gap-1.5">
              {wbData ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live · World Bank
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Database className="w-3 h-3" />
                  Data coming soon
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
