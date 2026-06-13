import type {
  City,
  CityDashboard,
  ComparisonMatrix,
  SearchResult,
} from "@/types/city";
import { CITIES, MOCK_DASHBOARDS } from "@/lib/data/mockCities";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

// ── Cities ────────────────────────────────────────────────────────────────────

export async function getCities(): Promise<City[]> {
  try {
    return await apiFetch<City[]>("/api/v1/cities");
  } catch {
    return CITIES;
  }
}

export async function searchCities(query: string): Promise<SearchResult> {
  try {
    return await apiFetch<SearchResult>(
      `/api/v1/cities/search?q=${encodeURIComponent(query)}`
    );
  } catch {
    const filtered = CITIES.filter(
      (c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.country.toLowerCase().includes(query.toLowerCase())
    );
    return { cities: filtered, total: filtered.length, query };
  }
}

export async function getCityDashboard(slug: string): Promise<CityDashboard> {
  try {
    return await apiFetch<CityDashboard>(`/api/v1/cities/${slug}/dashboard`);
  } catch {
    const dashboard = MOCK_DASHBOARDS[slug];
    if (!dashboard) throw new Error(`City not found: ${slug}`);
    return dashboard;
  }
}

// ── Comparison ────────────────────────────────────────────────────────────────

export async function getComparisonMatrix(
  slugs: string[]
): Promise<ComparisonMatrix> {
  try {
    return await apiFetch<ComparisonMatrix>("/api/v1/compare", {
      method: "POST",
      body: JSON.stringify({ city_slugs: slugs }),
    });
  } catch {
    // Build comparison from mock data
    const cities = slugs
      .map((s) => MOCK_DASHBOARDS[s]?.city)
      .filter(Boolean) as City[];

    return {
      cities,
      rows: [
        {
          metric: { label: "Population Growth", key: "growthRate", unit: "%/yr", format: "percentage", higherIsBetter: true },
          values: Object.fromEntries(slugs.map((s) => [s, MOCK_DASHBOARDS[s]?.latestPopulation?.growthRate ?? null])),
          best: slugs.reduce((a, b) => (MOCK_DASHBOARDS[a]?.latestPopulation?.growthRate ?? -99) > (MOCK_DASHBOARDS[b]?.latestPopulation?.growthRate ?? -99) ? a : b),
          worst: slugs.reduce((a, b) => (MOCK_DASHBOARDS[a]?.latestPopulation?.growthRate ?? 99) < (MOCK_DASHBOARDS[b]?.latestPopulation?.growthRate ?? 99) ? a : b),
        },
        {
          metric: { label: "Housing Pressure", key: "housingPressureScore", unit: "/100", format: "score", higherIsBetter: false },
          values: Object.fromEntries(slugs.map((s) => [s, MOCK_DASHBOARDS[s]?.scores?.housingPressureScore ?? null])),
          best: slugs.reduce((a, b) => (MOCK_DASHBOARDS[a]?.scores?.housingPressureScore ?? 99) < (MOCK_DASHBOARDS[b]?.scores?.housingPressureScore ?? 99) ? a : b),
          worst: slugs.reduce((a, b) => (MOCK_DASHBOARDS[a]?.scores?.housingPressureScore ?? -99) > (MOCK_DASHBOARDS[b]?.scores?.housingPressureScore ?? -99) ? a : b),
        },
        {
          metric: { label: "Aging Severity", key: "agingSeverityScore", unit: "/100", format: "score", higherIsBetter: false },
          values: Object.fromEntries(slugs.map((s) => [s, MOCK_DASHBOARDS[s]?.scores?.agingSeverityScore ?? null])),
          best: slugs.reduce((a, b) => (MOCK_DASHBOARDS[a]?.scores?.agingSeverityScore ?? 99) < (MOCK_DASHBOARDS[b]?.scores?.agingSeverityScore ?? 99) ? a : b),
          worst: slugs.reduce((a, b) => (MOCK_DASHBOARDS[a]?.scores?.agingSeverityScore ?? -99) > (MOCK_DASHBOARDS[b]?.scores?.agingSeverityScore ?? -99) ? a : b),
        },
        {
          metric: { label: "GDP per Capita", key: "gdpPerCapitaUsd", unit: "USD", format: "currency", higherIsBetter: true },
          values: Object.fromEntries(slugs.map((s) => [s, MOCK_DASHBOARDS[s]?.latestEconomic?.gdpPerCapitaUsd ?? null])),
          best: slugs.reduce((a, b) => (MOCK_DASHBOARDS[a]?.latestEconomic?.gdpPerCapitaUsd ?? 0) > (MOCK_DASHBOARDS[b]?.latestEconomic?.gdpPerCapitaUsd ?? 0) ? a : b),
          worst: slugs.reduce((a, b) => (MOCK_DASHBOARDS[a]?.latestEconomic?.gdpPerCapitaUsd ?? 99999) < (MOCK_DASHBOARDS[b]?.latestEconomic?.gdpPerCapitaUsd ?? 99999) ? a : b),
        },
        {
          metric: { label: "Median Age", key: "medianAge", unit: "years", format: "number" },
          values: Object.fromEntries(slugs.map((s) => [s, MOCK_DASHBOARDS[s]?.latestDemographics?.medianAge ?? null])),
          best: slugs[0],
          worst: slugs[0],
        },
        {
          metric: { label: "Price-to-Income Ratio", key: "priceToIncomeRatio", unit: "x", format: "number", higherIsBetter: false },
          values: Object.fromEntries(slugs.map((s) => [s, MOCK_DASHBOARDS[s]?.latestHousing?.priceToIncomeRatio ?? null])),
          best: slugs.reduce((a, b) => (MOCK_DASHBOARDS[a]?.latestHousing?.priceToIncomeRatio ?? 99) < (MOCK_DASHBOARDS[b]?.latestHousing?.priceToIncomeRatio ?? 99) ? a : b),
          worst: slugs.reduce((a, b) => (MOCK_DASHBOARDS[a]?.latestHousing?.priceToIncomeRatio ?? 0) > (MOCK_DASHBOARDS[b]?.latestHousing?.priceToIncomeRatio ?? 0) ? a : b),
        },
      ],
      generatedAt: new Date().toISOString(),
    };
  }
}

// ── AI ────────────────────────────────────────────────────────────────────────

export async function getAIInsight(slug: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/v1/ai/insights/${slug}`);
  if (!res.ok) throw new Error("Failed to fetch AI insight");
  const data = (await res.json()) as { content: string };
  return data.content;
}

export async function streamAIAnalysis(
  slug: string,
  onChunk: (text: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/ai/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ city_slug: slug }),
    signal,
  });
  if (!res.body) throw new Error("No response body");
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onChunk(decoder.decode(value, { stream: true }));
  }
}
