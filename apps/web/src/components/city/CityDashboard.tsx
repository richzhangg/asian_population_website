"use client";
import { motion } from "framer-motion";
import {
  Users,
  Home,
  DollarSign,
  Heart,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MetricCard from "@/components/city/MetricCard";
import PopulationTrendChart from "@/components/charts/PopulationTrendChart";
import HousingPriceChart from "@/components/charts/HousingPriceChart";
import GDPChart from "@/components/charts/GDPChart";
import AgePyramid from "@/components/charts/AgePyramid";
import { formatPopulation, formatCurrency, formatPercent } from "@/lib/utils/formatters";
import type { CityDashboard as CityDashboardType } from "@/types/city";

interface Props {
  data: CityDashboardType;
}

const SCORE_COLOR = (score: number) =>
  score >= 75 ? "text-rose-500" : score >= 50 ? "text-amber-500" : "text-emerald-500";

export default function CityDashboard({ data }: Props) {
  const { city, latestPopulation: pop, latestDemographics: demo, latestHousing: house, latestEconomic: econ, scores, populationHistory, housingHistory, economicHistory } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden h-56 sm:h-72"
      >
        {city.thumbnailUrl ? (
          <Image src={city.thumbnailUrl} alt={city.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
          <div>
            <h1 className="text-white text-3xl sm:text-5xl font-bold">{city.name}</h1>
            <p className="text-white/70 text-sm mt-1">{city.country} · {city.region}</p>
            <p className="text-white/60 text-sm mt-2 max-w-lg hidden sm:block">{city.description}</p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            {city.isMegacity && <Badge className="bg-blue-500 text-white border-0">Megacity</Badge>}
            <Badge variant="outline" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              Transformation Score: <span className={`ml-1 font-bold ${SCORE_COLOR(scores.overallTransformationScore)}`}>{scores.overallTransformationScore}/100</span>
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Score cards */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {[
          { label: "Housing Pressure", value: scores.housingPressureScore, suffix: "/100", bad: true },
          { label: "Aging Severity", value: scores.agingSeverityScore, suffix: "/100", bad: true },
          { label: "Economic Dynamism", value: scores.economicDynamismScore, suffix: "/100", bad: false },
          { label: "Migration Pressure", value: scores.migrationPressureScore, suffix: "/100", bad: true },
        ].map((s) => (
          <div key={s.label} className="glass-card rounded-2xl p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.bad ? SCORE_COLOR(s.value) : s.value >= 70 ? "text-emerald-500" : s.value >= 50 ? "text-amber-500" : "text-rose-500"}`}>
              {s.value}
            </p>
            <p className="text-xs text-muted-foreground">{s.suffix}</p>
          </div>
        ))}
      </motion.div>

      {/* Key metrics */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
      >
        <MetricCard label="Population" value={formatPopulation(pop.totalPopulation)} change={pop.growthRate} changeLabel="%/yr" icon={Users} color="blue" />
        <MetricCard label="Median Age" value={`${demo.medianAge} yrs`} icon={Heart} color="rose" />
        <MetricCard label="Fertility Rate" value={`${demo.fertilityRate}`} change={-0.08} icon={Heart} color="rose" higherIsBetter />
        <MetricCard label="Avg Price/m²" value={formatCurrency(house.avgPricePerSqm, 0)} change={5.2} changeLabel="%" icon={Home} color="amber" higherIsBetter={false} />
        <MetricCard label="Price-Income" value={`${house.priceToIncomeRatio}x`} icon={Home} color="amber" />
        <MetricCard label="GDP/Capita" value={formatCurrency(econ.gdpPerCapitaUsd, 0)} change={econ.gdpGrowthRate} changeLabel="%/yr" icon={DollarSign} color="emerald" />
      </motion.div>

      {/* Charts 2×2 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid md:grid-cols-2 gap-6"
      >
        <div className="glass-card rounded-2xl p-6">
          <PopulationTrendChart data={populationHistory} cityName={city.name} />
        </div>
        <div className="glass-card rounded-2xl p-6">
          <HousingPriceChart data={housingHistory} cityName={city.name} />
        </div>
        <div className="glass-card rounded-2xl p-6">
          <GDPChart data={economicHistory} cityName={city.name} />
        </div>
        <div className="glass-card rounded-2xl p-6">
          <AgePyramid data={demo} cityName={city.name} />
        </div>
      </motion.div>

      {/* Economic breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card rounded-2xl p-6"
      >
        <h3 className="font-semibold mb-4">Economic Structure</h3>
        <div className="space-y-3">
          {[
            { label: "Services", value: econ.servicesShare, color: "bg-blue-500" },
            { label: "Finance", value: econ.financeShare, color: "bg-indigo-500" },
            { label: "Technology", value: econ.techShare, color: "bg-teal-500" },
            { label: "Manufacturing", value: econ.manufacturingShare, color: "bg-amber-500" },
          ].map((sector) => (
            <div key={sector.label} className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground w-24">{sector.label}</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${sector.value}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className={`h-full rounded-full ${sector.color}`}
                />
              </div>
              <span className="text-sm font-semibold w-10 text-right">{sector.value}%</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Additional stats */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: "Unemployment", value: `${econ.unemploymentRate}%`, sub: "Labor market" },
          { label: "Homeownership", value: `${house.homeownershipRate}%`, sub: "Of households" },
          { label: "Rental Yield", value: `${house.rentalYield}%`, sub: "Gross annual" },
          { label: "Life Expectancy", value: `${demo.lifeExpectancy} yrs`, sub: "At birth" },
          { label: "Migrant Share", value: `${data.latestMigration.migrantShare}%`, sub: "Of total pop" },
          { label: "Net Migration", value: `+${(data.latestMigration.netMigration / 1000).toFixed(0)}K`, sub: "Annual net flow" },
          { label: "Vacancy Rate", value: `${house.vacancyRate}%`, sub: "Housing stock" },
          { label: "Gini Coefficient", value: `${econ.giniCoefficient}`, sub: "Income inequality" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-xl p-4">
            <p className="text-xs text-muted-foreground">{stat.sub}</p>
            <p className="text-xl font-bold mt-0.5">{stat.value}</p>
            <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <Link href="/compare" className="flex-1">
          <Button variant="gradient" className="w-full gap-2">
            <TrendingUp className="w-4 h-4" />
            Add to Compare
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
