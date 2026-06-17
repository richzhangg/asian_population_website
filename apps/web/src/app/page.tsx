import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import StatsCounter from "@/components/home/StatsCounter";
import CityPreview from "@/components/home/CityPreview";
import FeaturedInsights from "@/components/home/FeaturedInsights";
import CTASection from "@/components/home/CTASection";
import {
  fetchHomeStats,
  fetchHeroStats,
  fetchMultipleCitiesWBData,
} from "@/lib/services/worldbank";

export const metadata: Metadata = {
  title: "Asian Urban Transformation Matrix | AUTM",
};

const WB_PREVIEW_CITIES = [
  { slug: "tokyo", name: "Tokyo" },
  { slug: "seoul", name: "Seoul" },
  { slug: "shanghai", name: "Shanghai" },
  { slug: "hong-kong", name: "Hong Kong" },
];

export default async function HomePage() {
  // Fetch all home-page WB data in parallel; errors degrade gracefully
  const [homeStats, heroStats, previewDatasets] = await Promise.all([
    fetchHomeStats().catch(() => []),
    fetchHeroStats().catch(() => []),
    fetchMultipleCitiesWBData(WB_PREVIEW_CITIES).catch(() => []),
  ]);

  const previewBySlug = Object.fromEntries(
    previewDatasets.map((d) => [d.citySlug, d])
  );

  return (
    <>
      <Hero stats={heroStats} />
      <StatsCounter stats={homeStats} />
      <CityPreview wbBySlug={previewBySlug} />
      <FeaturedInsights />
      <CTASection />
    </>
  );
}
