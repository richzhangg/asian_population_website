"use client";
import useSWR from "swr";
import { getCityDashboard, getCities, searchCities } from "@/lib/api/cities";
import type { CityDashboard, City, SearchResult } from "@/types/city";

export function useCityDashboard(slug: string | null) {
  return useSWR<CityDashboard>(
    slug ? `city-dashboard-${slug}` : null,
    () => getCityDashboard(slug!),
    { revalidateOnFocus: false, dedupingInterval: 60_000 }
  );
}

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
