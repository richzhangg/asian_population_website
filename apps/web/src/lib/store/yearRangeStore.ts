"use client";
import { create } from "zustand";

export interface DateRange {
  start: number;
  end: number;
}

interface YearRangeStore {
  startYear: number | null; // null = use latest WB default
  endYear: number | null;
  setRange: (start: number, end: number) => void;
  reset: () => void;
}

export const useYearRangeStore = create<YearRangeStore>()((set) => ({
  startYear: null,
  endYear: null,
  setRange: (start, end) => set({ startYear: start, endYear: end }),
  reset: () => set({ startYear: null, endYear: null }),
}));

export const MIN_YEAR = 1990;
export const MAX_YEAR = 2025;
