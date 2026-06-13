"use client";
import { X, Plus } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useComparisonStore } from "@/lib/store/comparisonStore";
import CitySearch from "@/components/city/CitySearch";
import { Button } from "@/components/ui/button";

export default function ComparisonSelector() {
  const { selected, remove, clear } = useComparisonStore();
  const isEmpty = selected.length === 0;

  return (
    <div className="glass-card rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Comparing Cities</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {selected.length}/4 cities selected
          </p>
        </div>
        {!isEmpty && (
          <Button variant="ghost" size="sm" onClick={clear} className="text-xs text-muted-foreground">
            Clear all
          </Button>
        )}
      </div>

      {/* Selected cities */}
      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {selected.map((city) => (
            <motion.div
              key={city.slug}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2 pl-2 pr-1.5 py-1.5 rounded-xl bg-primary/10 border border-primary/20"
            >
              <div className="relative w-5 h-5 rounded overflow-hidden flex-shrink-0">
                {city.thumbnailUrl ? (
                  <Image src={city.thumbnailUrl} alt={city.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary/30" />
                )}
              </div>
              <span className="text-sm font-medium text-primary">{city.name}</span>
              <button onClick={() => remove(city.slug)} className="text-primary/60 hover:text-primary transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {selected.length < 4 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-border text-xs text-muted-foreground">
            <Plus className="w-3 h-3" />
            Add city
          </div>
        )}
      </div>

      {/* Search */}
      <CitySearch
        placeholder="Search and add city to comparison…"
        showCompareAdd
      />
    </div>
  );
}
