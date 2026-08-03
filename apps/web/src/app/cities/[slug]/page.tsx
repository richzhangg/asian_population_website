import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CITIES } from "@/lib/data/mockCities";
import {
  fetchCityWorldBankData,
  hasCityWBData,
} from "@/lib/services/worldbank";
import WorldBankDashboard from "@/components/city/WorldBankDashboard";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES.find((c) => c.slug === slug);
  if (!city) return { title: "City Not Found" };
  return {
    title: `${city.name} · World Bank Population Data`,
    description: `Live population, density, and urbanization data for ${city.name} (${city.country}) sourced from the World Bank Open Data API.`,
  };
}

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return CITIES.map((city) => ({ slug: city.slug }));
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-pulse">
      <div className="h-72 bg-muted rounded-3xl" />
      <div className="h-6 w-48 bg-muted rounded-full" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-36 bg-muted rounded-2xl" />
        ))}
      </div>
      <div className="h-72 bg-muted rounded-2xl" />
      <div className="h-48 bg-muted rounded-2xl" />
    </div>
  );
}

// ── "No data" state for cities outside the 4 WB targets ──────────────────────

function CityNotAvailable({ name, country, region, description }: {
  name: string;
  country: string;
  region: string;
  description: string;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
      <div className="glass-card rounded-2xl p-10 max-w-lg mx-auto text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto">
          <span className="text-2xl">🏙️</span>
        </div>
        <h2 className="text-xl font-bold">{name}</h2>
        <p className="text-sm text-muted-foreground">
          {country} · {region}
        </p>
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="pt-2 border-t border-border text-xs text-muted-foreground">
          Live World Bank data is currently available for{" "}
          <strong>Tokyo, Seoul, Shanghai,</strong> and{" "}
          <strong>Hong Kong</strong>. Additional cities will be added in a
          future update.
        </div>
      </div>
    </div>
  );
}

// ── Error state ───────────────────────────────────────────────────────────────

function CityDataError({ name, message }: { name: string; message: string }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
      <div className="glass-card rounded-2xl p-10 max-w-lg mx-auto text-center space-y-3">
        <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center mx-auto">
          <span className="text-2xl">⚠️</span>
        </div>
        <h2 className="text-xl font-bold">{name}</h2>
        <p className="text-sm text-muted-foreground">
          Unable to fetch World Bank data at this time.
        </p>
        <p className="text-xs text-muted-foreground/60 font-mono">{message}</p>
        <p className="text-xs text-muted-foreground pt-2">
          Please try refreshing the page. If the issue persists, the World Bank
          API may be temporarily unavailable.
        </p>
      </div>
    </div>
  );
}

// ── Async data-fetching server component ──────────────────────────────────────

async function CityDataFetcher({ slug }: { slug: string }) {
  const city = CITIES.find((c) => c.slug === slug);
  if (!city) notFound();

  if (!hasCityWBData(slug)) {
    return (
      <CityNotAvailable
        name={city.name}
        country={city.country}
        region={city.region}
        description={city.description}
      />
    );
  }

  try {
    const wbData = await fetchCityWorldBankData(slug, city.name);
    return <WorldBankDashboard city={city} wbData={wbData} />;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error";
    return <CityDataError name={city.name} message={message} />;
  }
}

// ── Page entry point ──────────────────────────────────────────────────────────

export default async function CityPage({ params }: Props) {
  const { slug } = await params;
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <CityDataFetcher slug={slug} />
    </Suspense>
  );
}
