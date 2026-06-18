"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { GitCompareArrows, AlertCircle, BarChart3, Table } from "lucide-react";
import ComparisonSelector from "@/components/comparison/ComparisonSelector";
import ComparisonTable from "@/components/comparison/ComparisonTable";
import ComparisonCharts from "@/components/comparison/ComparisonCharts";
import { useComparisonStore } from "@/lib/store/comparisonStore";
import { useYearRangeStore } from "@/lib/store/yearRangeStore";
import { getComparisonMatrix } from "@/lib/api/cities";
import YearRangePicker from "@/components/ui/YearRangePicker";
import { MIN_YEAR, MAX_YEAR } from "@/lib/store/yearRangeStore";
import useSWR from "swr";
import { cn } from "@/lib/utils/cn";
import DownloadPDFButton from "@/components/ui/DownloadPDFButton";

type Tab = "charts" | "table";

export default function ComparePage() {
  const selected = useComparisonStore((s) => s.selected);
  const slugs = selected.map((c) => c.slug);
  const [activeTab, setActiveTab] = useState<Tab>("charts");
  const { startYear, endYear } = useYearRangeStore();
  const dateRange = startYear !== null && endYear !== null ? { start: startYear, end: endYear } : undefined;
  const rangeKey = startYear ?? "latest";
  const key = slugs.length >= 2 ? `compare-${slugs.join("-")}-${rangeKey}-${endYear ?? "latest"}` : null;

  const { data: matrix, isLoading } = useSWR(
    key,
    () => getComparisonMatrix(slugs, dateRange),
    { revalidateOnFocus: false }
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <GitCompareArrows className="w-5 h-5 text-primary" />
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Comparison Matrix
          </p>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold mb-3">Compare Cities</h1>
        <p className="text-muted-foreground max-w-xl">
          Select 2–4 Asian cities to compare side-by-side across housing, demographics, and economic metrics — visualised as charts and a data table.
        </p>
      </div>

      {/* Year range picker */}
      <div className="glass-card rounded-xl px-4 py-3">
        <YearRangePicker />
      </div>

      {/* City selector */}
      <ComparisonSelector />

      {/* Results */}
      {selected.length < 2 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center glass-card rounded-2xl"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <GitCompareArrows className="w-8 h-8 text-primary/50" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Select at least 2 cities</h3>
          <p className="text-muted-foreground text-sm max-w-xs">
            Use the search above to add cities to your comparison. You can compare up to 4 cities at once.
          </p>
        </motion.div>
      ) : isLoading ? (
        <div className="glass-card rounded-2xl p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-48" />
            <div className="h-64 bg-muted rounded-xl" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-48 bg-muted rounded-xl" />
              <div className="h-48 bg-muted rounded-xl" />
            </div>
          </div>
        </div>
      ) : matrix ? (
        <div className="space-y-5">
          {/* Tab switcher + PDF download */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1 p-1 glass-card rounded-xl w-fit">
            {([
              { id: "charts" as Tab, label: "Charts", icon: BarChart3 },
              { id: "table" as Tab, label: "Data Table", icon: Table },
            ] as const).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  activeTab === id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
          <DownloadPDFButton
            mode="compare"
            matrix={matrix}
            yearRange={{ start: startYear ?? 2009, end: endYear ?? MAX_YEAR }}
          />
          </div>

          {/* Content */}
          {activeTab === "charts" ? (
            <ComparisonCharts matrix={matrix} />
          ) : (
            <ComparisonTable matrix={matrix} />
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-muted-foreground text-sm p-4 glass-card rounded-xl">
          <AlertCircle className="w-4 h-4" />
          Failed to generate comparison. Ensure you have data for the selected cities.
        </div>
      )}
    </div>
  );
}
