import type {
  City,
  ComparisonMatrix,
  SearchResult,
} from "@/types/city";
import type { WorldBankCityData } from "@/types/worldbank";
import { CITIES } from "@/lib/data/mockCities";
import {
  fetchMultipleCitiesWBData,
  hasCityWBData,
  WB_INDICATORS,
  type DateRange,
} from "@/lib/services/worldbank";

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

// ── Comparison ────────────────────────────────────────────────────────────────

/**
 * Build a ComparisonMatrix from live World Bank data for the given city slugs.
 * Only cities that have a WB country mapping (tokyo, seoul, shanghai, hong-kong)
 * will return real values; others will show null.
 */
async function buildWBComparisonMatrix(slugs: string[], dateRange?: DateRange): Promise<ComparisonMatrix> {
  const targets = slugs
    .filter(hasCityWBData)
    .map((s) => {
      const city = CITIES.find((c) => c.slug === s)!;
      return { slug: s, name: city.name };
    });

  const datasets = await fetchMultipleCitiesWBData(targets, dateRange);
  const bySlug = Object.fromEntries(datasets.map((d) => [d.citySlug, d]));

  const cities = slugs
    .map((s) => CITIES.find((c) => c.slug === s))
    .filter((c): c is City => c !== undefined);

  type WBField =
    | "totalPopulation"
    | "populationDensity"
    | "urbanPopulation"
    | "urbanPopulationPercent"
    | "gdp"
    | "gdpPerCapita"
    | "gdpGrowth"
    | "unemployment"
    | "inflation";

  function getFieldValue(d: WorldBankCityData, key: WBField): number | null {
    switch (key) {
      case "totalPopulation": return d.totalPopulation.value;
      case "populationDensity": return d.populationDensity.value;
      case "urbanPopulation": return d.urbanPopulation.value;
      case "urbanPopulationPercent": return d.urbanPopulationPercent.value;
      case "gdp": return d.economicData.gdp.value;
      case "gdpPerCapita": return d.economicData.gdpPerCapita.value;
      case "gdpGrowth": return d.economicData.gdpGrowth.value;
      case "unemployment": return d.economicData.unemployment.value;
      case "inflation": return d.economicData.inflation.value;
    }
  }

  function best(key: WBField, higherIsBetter: boolean): string {
    let winner = slugs[0];
    for (const s of slugs) {
      const d = bySlug[s];
      if (!d) continue;
      const dWinner = bySlug[winner];
      const vCurr = getFieldValue(d, key);
      const vWinner = dWinner ? getFieldValue(dWinner, key) : null;
      if (vCurr === null) continue;
      if (vWinner === null || (higherIsBetter ? vCurr > vWinner : vCurr < vWinner)) {
        winner = s;
      }
    }
    return winner;
  }

  return {
    cities,
    rows: [
      {
        metric: {
          label: "Total Population",
          key: "totalPopulation",
          unit: "people",
          format: "number",
          higherIsBetter: true,
        },
        values: Object.fromEntries(
          slugs.map((s) => [s, bySlug[s]?.totalPopulation.value ?? null])
        ),
        best: best("totalPopulation", true),
        worst: best("totalPopulation", false),
      },
      {
        metric: {
          label: "Population Density",
          key: "populationDensity",
          unit: "per km²",
          format: "number",
          higherIsBetter: false,
        },
        values: Object.fromEntries(
          slugs.map((s) => [s, bySlug[s]?.populationDensity.value ?? null])
        ),
        best: best("populationDensity", false),
        worst: best("populationDensity", true),
      },
      {
        metric: {
          label: "Urban Population",
          key: "urbanPopulation",
          unit: "people",
          format: "number",
          higherIsBetter: true,
        },
        values: Object.fromEntries(
          slugs.map((s) => [s, bySlug[s]?.urbanPopulation.value ?? null])
        ),
        best: best("urbanPopulation", true),
        worst: best("urbanPopulation", false),
      },
      {
        metric: {
          label: "Urbanization Rate",
          key: "urbanPopulationPercent",
          unit: "%",
          format: "percentage",
          higherIsBetter: true,
        },
        values: Object.fromEntries(
          slugs.map((s) => [s, bySlug[s]?.urbanPopulationPercent.value ?? null])
        ),
        best: best("urbanPopulationPercent", true),
        worst: best("urbanPopulationPercent", false),
      },
      {
        metric: {
          label: "GDP",
          key: "gdp",
          unit: "current USD",
          format: "number",
          higherIsBetter: true,
        },
        values: Object.fromEntries(
          slugs.map((s) => [s, bySlug[s]?.economicData.gdp.value ?? null])
        ),
        best: best("gdp", true),
        worst: best("gdp", false),
      },
      {
        metric: {
          label: "GDP per Capita",
          key: "gdpPerCapita",
          unit: "current USD",
          format: "currency",
          higherIsBetter: true,
        },
        values: Object.fromEntries(
          slugs.map((s) => [s, bySlug[s]?.economicData.gdpPerCapita.value ?? null])
        ),
        best: best("gdpPerCapita", true),
        worst: best("gdpPerCapita", false),
      },
      {
        metric: {
          label: "GDP Growth",
          key: "gdpGrowth",
          unit: "annual %",
          format: "percentage",
          higherIsBetter: true,
        },
        values: Object.fromEntries(
          slugs.map((s) => [s, bySlug[s]?.economicData.gdpGrowth.value ?? null])
        ),
        best: best("gdpGrowth", true),
        worst: best("gdpGrowth", false),
      },
      {
        metric: {
          label: "Unemployment Rate",
          key: "unemployment",
          unit: "% of labor force",
          format: "percentage",
          higherIsBetter: false,
        },
        values: Object.fromEntries(
          slugs.map((s) => [s, bySlug[s]?.economicData.unemployment.value ?? null])
        ),
        best: best("unemployment", false),
        worst: best("unemployment", true),
      },
      {
        metric: {
          label: "Inflation (CPI)",
          key: "inflation",
          unit: "annual %",
          format: "percentage",
          higherIsBetter: false,
        },
        values: Object.fromEntries(
          slugs.map((s) => [s, bySlug[s]?.economicData.inflation.value ?? null])
        ),
        best: best("inflation", false),
        worst: best("inflation", true),
      },
    ],
    generatedAt: new Date().toISOString(),
  };
}

export async function getComparisonMatrix(
  slugs: string[],
  dateRange?: DateRange
): Promise<ComparisonMatrix> {
  // Skip the backend API when a custom date range is requested
  if (!dateRange) {
    try {
      return await apiFetch<ComparisonMatrix>("/api/v1/compare", {
        method: "POST",
        body: JSON.stringify({ city_slugs: slugs }),
      });
    } catch {
      // fall through
    }
  }
  return buildWBComparisonMatrix(slugs, dateRange);
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

// Re-export so existing imports of WB_INDICATORS from this module still work
export { WB_INDICATORS };
