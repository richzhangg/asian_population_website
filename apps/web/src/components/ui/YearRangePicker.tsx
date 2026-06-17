"use client";
import { CalendarRange, RotateCcw } from "lucide-react";
import { useYearRangeStore, MIN_YEAR, MAX_YEAR } from "@/lib/store/yearRangeStore";

const YEARS = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MIN_YEAR + i);

export default function YearRangePicker() {
  const { startYear, endYear, setRange, reset } = useYearRangeStore();
  const isCustom = startYear !== null && endYear !== null;

  const start = startYear ?? 2009;
  const end = endYear ?? MAX_YEAR;

  function handleStart(v: number) {
    setRange(v, Math.max(v, end));
  }

  function handleEnd(v: number) {
    setRange(Math.min(v, start), v);
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <CalendarRange className="w-3.5 h-3.5" />
        <span className="font-medium">Year range:</span>
      </div>

      <div className="flex items-center gap-1.5">
        <select
          value={start}
          onChange={(e) => handleStart(Number(e.target.value))}
          className="text-xs bg-muted border border-border rounded-lg px-2 py-1.5 tabular-nums focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <span className="text-xs text-muted-foreground">to</span>

        <select
          value={end}
          onChange={(e) => handleEnd(Number(e.target.value))}
          className="text-xs bg-muted border border-border rounded-lg px-2 py-1.5 tabular-nums focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {YEARS.map((y) => (
            <option key={y} value={y} disabled={y < start}>{y}</option>
          ))}
        </select>
      </div>

      {isCustom && (
        <button
          onClick={reset}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border border-border/60 rounded-lg px-2 py-1.5 transition-colors hover:border-border"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      )}

      {!isCustom && (
        <span className="text-xs text-muted-foreground/60 italic">showing latest available</span>
      )}
    </div>
  );
}
