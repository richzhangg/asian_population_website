import type { Metadata } from "next";
import { Suspense } from "react";
import CitySearch from "@/components/city/CitySearch";
import CityCard from "@/components/city/CityCard";
import { CITIES } from "@/lib/data/mockCities";

export const metadata: Metadata = {
  title: "City Search",
  description: "Search and explore demographics, housing, and economic data for Asian cities.",
};

export default function CitiesPage() {
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
          Search 10 Asian megacities. Click any city to open its full demographic,
          housing, and economic dashboard.
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
          <CityCard key={city.slug} city={city} index={i} />
        ))}
      </div>
    </div>
  );
}
