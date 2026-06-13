"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { City } from "@/types/city";

interface ComparisonStore {
  selected: City[];
  add: (city: City) => void;
  remove: (slug: string) => void;
  clear: () => void;
  isSelected: (slug: string) => boolean;
  isFull: () => boolean;
}

export const useComparisonStore = create<ComparisonStore>()(
  persist(
    (set, get) => ({
      selected: [],
      add: (city) => {
        if (get().selected.length >= 4) return;
        if (get().isSelected(city.slug)) return;
        set((s) => ({ selected: [...s.selected, city] }));
      },
      remove: (slug) =>
        set((s) => ({ selected: s.selected.filter((c) => c.slug !== slug) })),
      clear: () => set({ selected: [] }),
      isSelected: (slug) => get().selected.some((c) => c.slug === slug),
      isFull: () => get().selected.length >= 4,
    }),
    { name: "autm-comparison" }
  )
);
