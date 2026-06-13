"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Globe, X, Loader2 } from "lucide-react";
import { useCitySearch } from "@/lib/hooks/useCityData";
import { useComparisonStore } from "@/lib/store/comparisonStore";
import { cn } from "@/lib/utils/cn";

interface Props {
  placeholder?: string;
  showCompareAdd?: boolean;
  className?: string;
}

export default function CitySearch({
  placeholder = "Search Asian cities…",
  showCompareAdd = false,
  className,
}: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { data, isLoading } = useCitySearch(query);
  const { add, isSelected, isFull } = useComparisonStore();

  useEffect(() => {
    if (data?.cities?.length) setOpen(true);
    else setOpen(false);
  }, [data]);

  const handleSelect = (slug: string) => {
    setQuery("");
    setOpen(false);
    router.push(`/cities/${slug}`);
  };

  return (
    <div className={cn("relative", className)}>
      {/* Input */}
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full h-11 pl-10 pr-10 rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
        />
        {isLoading && (
          <Loader2 className="absolute right-3.5 w-4 h-4 text-muted-foreground animate-spin" />
        )}
        {query && !isLoading && (
          <button
            onClick={() => { setQuery(""); setOpen(false); }}
            className="absolute right-3.5"
          >
            <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {open && data?.cities && data.cities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 z-50 glass-card rounded-xl shadow-xl overflow-hidden"
          >
            <ul className="py-1 max-h-64 overflow-y-auto">
              {data.cities.map((city) => (
                <li key={city.slug}>
                  <div className="flex items-center justify-between px-3 py-2.5 hover:bg-accent transition-colors cursor-pointer group">
                    <button
                      className="flex items-center gap-2.5 flex-1 text-left"
                      onClick={() => handleSelect(city.slug)}
                    >
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Globe className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{city.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {city.country} · {city.region}
                        </p>
                      </div>
                    </button>

                    {showCompareAdd && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          add(city);
                        }}
                        disabled={isSelected(city.slug) || isFull()}
                        className={cn(
                          "text-xs px-2 py-1 rounded-lg font-medium transition-colors ml-2 flex-shrink-0",
                          isSelected(city.slug)
                            ? "bg-primary/20 text-primary cursor-default"
                            : isFull()
                            ? "bg-muted text-muted-foreground cursor-not-allowed"
                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                        )}
                      >
                        {isSelected(city.slug) ? "Added" : isFull() ? "Full" : "+ Compare"}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
