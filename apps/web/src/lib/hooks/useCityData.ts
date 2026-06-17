"use client";
import useSWR from "swr";
import { getCities, searchCities } from "@/lib/api/cities";
import type { City, SearchResult } from "@/types/city";

// City dashboards are now fetched server-side via the World Bank service.
// This hook is kept for the cities list and search, which remain client-side.

export function useCities() {
  return useSWR<City[]>("cities", getCities, {
    revalidateOnFocus: false,
    dedupingInterval: 300_000,
  });
}

export function useCitySearch(query: string) {
  return useSWR<SearchResult>(
    query.length >= 2 ? `search-${query}` : null,
    () => searchCities(query),
    { revalidateOnFocus: false, dedupingInterval: 30_000 }
  );
}
