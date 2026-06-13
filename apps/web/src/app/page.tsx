import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import StatsCounter from "@/components/home/StatsCounter";
import CityPreview from "@/components/home/CityPreview";
import FeaturedInsights from "@/components/home/FeaturedInsights";
import CTASection from "@/components/home/CTASection";

export const metadata: Metadata = {
  title: "Asian Urban Transformation Matrix | AUTM",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsCounter />
      <CityPreview />
      <FeaturedInsights />
      <CTASection />
    </>
  );
}
