import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CITIES, MOCK_DASHBOARDS } from "@/lib/data/mockCities";
import CityDashboardComponent from "@/components/city/CityDashboard";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES.find((c) => c.slug === slug);
  if (!city) return { title: "City Not Found" };
  return {
    title: `${city.name} Dashboard`,
    description: `Demographics, housing, and economic data for ${city.name}, ${city.country}.`,
  };
}

export function generateStaticParams() {
  return CITIES.map((city) => ({ slug: city.slug }));
}

export default async function CityPage({ params }: Props) {
  const { slug } = await params;
  const dashboard = MOCK_DASHBOARDS[slug];
  if (!dashboard) notFound();

  return <CityDashboardComponent data={dashboard} />;
}
