import type { Metadata } from "next";
import { Suspense } from "react";
import CitySearch from "@/components/city/CitySearch";
import CityCard from "@/components/city/CityCard";
import { CITIES } from "@/lib/data/mockCities";
import { fetchMultipleCitiesWBData, hasCityWBData } from "@/lib/services/worldbank";
import type { WorldBankCityData } from "@/types/worldbank";

export const metadata: Metadata = {
  title: "City Search · Asian Urban Transformation Matrix",
  description:
    "Explore live World Bank population data for Asian cities including Tokyo, Seoul, Shanghai, and Hong Kong.",
};

// Fetch population data for all WB-enabled cities to show on cards
async function getCardData(): Promise<Record<string, WorldBankCityData>> {
  const targets = CITIES.filter((c) => hasCityWBData(c.slug)).map((c) => ({
    slug: c.slug,
    name: c.name,
  }));

  try {
    const datasets = await fetchMultipleCitiesWBData(targets);
    return Object.fromEntries(datasets.map((d) => [d.citySlug, d]));
  } catch {
    return {};
  }
}

export default async function CitiesPage() {
  const wbBySlug = await getCardData();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Page header */}
      <div className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">
          City Database
        </p>
        <h1 className="text-3xl sm:text-5xl font-bold mb-4">
          Explore Asian Cities
        </h1>
        <p className="text-muted-foreground max-w-xl">
          Browse 10 Asian cities. Click any city to open its full World Bank
          data dashboard. Live data is available for Tokyo, Seoul, Shanghai, and
          Hong Kong.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-lg mb-10">
        <Suspense>
          <CitySearch placeholder="Search cities…" />
        </Suspense>
      </div>

      {/* City grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {CITIES.map((city, i) => (
          <CityCard
            key={city.slug}
            city={city}
            index={i}
            wbData={wbBySlug[city.slug]}
          />
        ))}
      </div>
    </div>
  );
}
