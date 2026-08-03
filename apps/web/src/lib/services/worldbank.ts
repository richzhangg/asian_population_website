import type {
  WorldBankCityData,
  WorldBankEconomicData,
  WorldBankIndicatorValue,
  WorldBankHomeStat,
  WorldBankHeroStat,
} from "@/types/worldbank";
import { UN_WUP, interpolateAnnual, getPopAtYear } from "@/lib/data/unwupData";

const WB_BASE = "https://api.worldbank.org/v2";

export const WB_INDICATORS = {
  TOTAL_POPULATION: "SP.POP.TOTL",
  POPULATION_DENSITY: "EN.POP.DNST",
  URBAN_POPULATION: "SP.URB.TOTL",
  URBAN_POPULATION_PCT: "SP.URB.TOTL.IN.ZS",
  GDP: "NY.GDP.MKTP.CD",
  GDP_PER_CAPITA: "NY.GDP.PCAP.CD",
  GDP_GROWTH: "NY.GDP.MKTP.KD.ZG",
  UNEMPLOYMENT: "SL.UEM.TOTL.ZS",
  INFLATION: "FP.CPI.TOTL.ZG",
} as const;

// Mapping from city slug to World Bank country code
export const CITY_COUNTRY_MAP: Record<string, string> = {
  tokyo: "JPN",
  seoul: "KOR",
  shanghai: "CHN",
  "hong-kong": "HKG",
};

export function hasCityWBData(slug: string): boolean {
  return slug in CITY_COUNTRY_MAP;
}

// ── Internal types ────────────────────────────────────────────────────────────

type WBEntry = {
  date: string;
  value: number | null;
  indicator: { id: string; value: string };
  country: { id: string; value: string };
  countryiso3code: string;
};

type WBApiResponse = [
  { page: number; pages: number; per_page: number; total: number },
  WBEntry[] | null,
];

type IndicatorResult = {
  data: WorldBankIndicatorValue;
  countryName: string;
};

export interface DateRange {
  start: number;
  end: number;
}

// ── Core fetch helpers ────────────────────────────────────────────────────────

function buildDateParam(dateRange?: DateRange): { dateParam: string; perPage: number } {
  if (dateRange) {
    const perPage = Math.min(Math.max(dateRange.end - dateRange.start + 2, 5), 60);
    return { dateParam: `date=${dateRange.start}:${dateRange.end}`, perPage };
  }
  return { dateParam: "mrv=10", perPage: 10 };
}

async function wbFetch(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 86400 },
      headers: { Accept: "application/json" },
    });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

async function fetchIndicator(
  countryCode: string,
  indicatorId: string,
  dateRange?: DateRange
): Promise<IndicatorResult> {
  const { dateParam, perPage } = buildDateParam(dateRange);
  const url = `${WB_BASE}/country/${countryCode}/indicator/${indicatorId}?format=json&${dateParam}&per_page=${perPage}`;

  const res = await wbFetch(url);

  if (!res.ok) {
    throw new Error(
      `World Bank API error ${res.status} for ${indicatorId}/${countryCode}`
    );
  }

  const raw = (await res.json()) as WBApiResponse;
  const entries = raw[1] ?? [];

  // Pick the most recent entry that has a non-null value
  const latest = entries.find((e) => e.value !== null);

  return {
    data: {
      indicatorId,
      indicatorName: entries[0]?.indicator?.value ?? indicatorId,
      value: latest?.value ?? null,
      year: latest ? parseInt(latest.date, 10) : null,
    },
    countryName: entries[0]?.country?.value ?? countryCode,
  };
}

async function fetchHistory(
  countryCode: string,
  indicatorId: string,
  dateRange?: DateRange
): Promise<Array<{ year: number; value: number }>> {
  const { dateParam, perPage: basePP } = buildDateParam(dateRange);
  const perPage = dateRange ? basePP : 15;
  const dateParamFinal = dateRange ? dateParam : "mrv=15";
  const url = `${WB_BASE}/country/${countryCode}/indicator/${indicatorId}?format=json&${dateParamFinal}&per_page=${perPage}`;

  try {
    const res = await wbFetch(url);
    if (!res.ok) return [];

    const raw = (await res.json()) as WBApiResponse;
    return (raw[1] ?? [])
      .filter((e): e is WBEntry & { value: number } => e.value !== null)
      .map((e) => ({ year: parseInt(e.date, 10), value: e.value }))
      .sort((a, b) => a.year - b.year);
  } catch {
    return [];
  }
}

async function fetchPopulationHistory(
  countryCode: string,
  dateRange?: DateRange
): Promise<Array<{ year: number; value: number }>> {
  return fetchHistory(countryCode, WB_INDICATORS.TOTAL_POPULATION, dateRange);
}

async function fetchGdpHistory(
  countryCode: string,
  dateRange?: DateRange
): Promise<Array<{ year: number; value: number }>> {
  if (!dateRange) {
    // Fetch a wide default range so the client can filter without re-fetching
    return fetchHistory(countryCode, WB_INDICATORS.GDP, { start: 1990, end: 2026 });
  }
  return fetchHistory(countryCode, WB_INDICATORS.GDP, dateRange);
}

// ── Economic fetch (sequential to avoid WB rate-limiting) ────────────────────

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchAllEconomicData(
  countryCode: string,
  dateRange?: DateRange
): Promise<WorldBankEconomicData> {
  const gdpResult = await fetchIndicator(countryCode, WB_INDICATORS.GDP, dateRange);
  await delay(200);
  const gdpPerCapitaResult = await fetchIndicator(countryCode, WB_INDICATORS.GDP_PER_CAPITA, dateRange);
  await delay(200);
  const gdpGrowthResult = await fetchIndicator(countryCode, WB_INDICATORS.GDP_GROWTH, dateRange);
  await delay(200);
  const unemploymentResult = await fetchIndicator(countryCode, WB_INDICATORS.UNEMPLOYMENT, dateRange);
  await delay(200);
  const inflationResult = await fetchIndicator(countryCode, WB_INDICATORS.INFLATION, dateRange);
  await delay(200);
  const gdpHistory = await fetchGdpHistory(countryCode, dateRange);

  return {
    gdp: gdpResult.data,
    gdpPerCapita: gdpPerCapitaResult.data,
    gdpGrowth: gdpGrowthResult.data,
    unemployment: unemploymentResult.data,
    inflation: inflationResult.data,
    gdpHistory,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetch city data using UN WUP (city-level population) + World Bank (economics).
 * Population figures are city/agglomeration level from UN WUP 2022.
 * Economic indicators (GDP, unemployment, inflation) remain country-level from World Bank.
 */
export async function fetchCityWorldBankData(
  citySlug: string,
  cityName: string,
  dateRange?: DateRange
): Promise<WorldBankCityData> {
  const wup = UN_WUP[citySlug];
  const countryCode = wup?.countryCode ?? CITY_COUNTRY_MAP[citySlug];
  if (!countryCode) {
    throw new Error(`No data mapping for city: ${citySlug}`);
  }
  if (!wup) {
    throw new Error(`No UN WUP data for city: ${citySlug}`);
  }

  // Build annual population series from UN WUP anchor points
  const startY = dateRange?.start ?? 1990;
  const endY = dateRange?.end ?? 2025;
  const annualPop = interpolateAnnual(wup.populationSeries, Math.min(startY, 1990), Math.max(endY, 2025));

  // Filter to requested range for history
  const popHistory = annualPop.filter((p) => p.year >= startY && p.year <= endY);

  // Pick the most recent population value within the requested range
  const latestPop = getPopAtYear(annualPop, endY);

  const totalPopulation: WorldBankIndicatorValue = {
    indicatorId: "UN.WUP.URBAN.AGGL",
    indicatorName: "Population of Urban Agglomeration (UN WUP 2022)",
    value: latestPop?.value ?? null,
    year: latestPop?.year ?? null,
  };

  // Density = population / area
  const densityValue = latestPop && wup.areaSqKm
    ? latestPop.value / wup.areaSqKm
    : null;
  const populationDensity: WorldBankIndicatorValue = {
    indicatorId: "UN.WUP.DENSITY",
    indicatorName: "Population Density (UN WUP 2022)",
    value: densityValue,
    year: latestPop?.year ?? null,
  };

  // Urban agglomerations are fully urban by definition
  const urbanPopulation: WorldBankIndicatorValue = {
    indicatorId: "UN.WUP.URBAN.POP",
    indicatorName: "Urban Population (UN WUP 2022)",
    value: latestPop?.value ?? null,
    year: latestPop?.year ?? null,
  };
  const urbanPopulationPercent: WorldBankIndicatorValue = {
    indicatorId: "UN.WUP.URBAN.PCT",
    indicatorName: "Urban Population % (Urban Agglomeration)",
    value: 100,
    year: latestPop?.year ?? null,
  };

  // Fetch all economic indicators in ONE request to avoid rate-limiting
  const economicData = await fetchAllEconomicData(countryCode, dateRange);

  return {
    citySlug,
    cityName,
    countryCode,
    countryName: wup.agglomerationName,
    totalPopulation,
    populationDensity,
    urbanPopulation,
    urbanPopulationPercent,
    populationHistory: popHistory,
    economicData,
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Fetch WB data for multiple cities in parallel.
 * Failed fetches are silently dropped so one bad city doesn't break the rest.
 */
export async function fetchMultipleCitiesWBData(
  cities: Array<{ slug: string; name: string }>,
  dateRange?: DateRange
): Promise<WorldBankCityData[]> {
  const results = await Promise.allSettled(
    cities.map((c) => fetchCityWorldBankData(c.slug, c.name, dateRange))
  );
  return results
    .filter(
      (r): r is PromiseFulfilledResult<WorldBankCityData> =>
        r.status === "fulfilled"
    )
    .map((r) => r.value);
}

// ── Home-page helpers ─────────────────────────────────────────────────────────

/**
 * Derive the six animated stats shown in StatsCounter from live WB data.
 * Falls back gracefully if a fetch fails.
 */
export async function fetchHomeStats(): Promise<WorldBankHomeStat[]> {
  const target = [
    { slug: "tokyo", name: "Tokyo" },
    { slug: "seoul", name: "Seoul" },
    { slug: "shanghai", name: "Shanghai" },
    { slug: "hong-kong", name: "Hong Kong" },
  ];

  const datasets = await fetchMultipleCitiesWBData(target);

  const bySlug: Record<string, WorldBankCityData> = {};
  for (const d of datasets) bySlug[d.citySlug] = d;

  // Combined population (JPN + KOR + CHN + HKG)
  const totalPop = datasets.reduce(
    (sum, d) => sum + (d.totalPopulation.value ?? 0),
    0
  );

  // Highest urbanization rate
  const hkg = bySlug["hong-kong"];
  const hkgUrban = hkg?.urbanPopulationPercent.value ?? 100;

  // China population (largest)
  const chn = bySlug["shanghai"];
  const chnPop = chn?.totalPopulation.value ?? 1_400_000_000;

  // Japan population density
  const jpn = bySlug["tokyo"];
  const jpnDensity = jpn?.populationDensity.value ?? 340;

  // South Korea urban %
  const kor = bySlug["seoul"];
  const korUrban = kor?.urbanPopulationPercent.value ?? 81;

  // HK population density (most dense)
  const hkgDensity = hkg?.populationDensity.value ?? 7100;

  return [
    {
      label: "People Across 4 Tracked Cities",
      sub: "Tokyo · Seoul · Shanghai · Hong Kong",
      value: totalPop / 1_000_000_000,
      suffix: "B",
      decimals: 2,
    },
    {
      label: "Hong Kong Population Density",
      sub: "People per km² (urban agglomeration)",
      value: hkgDensity,
      suffix: "/km²",
      decimals: 0,
    },
    {
      label: "Shanghai Urban Population",
      sub: "Largest tracked city agglomeration",
      value: chnPop / 1_000_000,
      suffix: "M",
      decimals: 1,
    },
    {
      label: "Tokyo Population Density",
      sub: "People per km² (Tokyo Metropolis)",
      value: jpnDensity,
      suffix: "/km²",
      decimals: 0,
    },
    {
      label: "Seoul City Population",
      sub: "Seoul Special Metropolitan City",
      value: korUrban,
      suffix: "%",
      decimals: 1,
    },
    {
      label: "Tokyo Urban Agglomeration",
      sub: "World's largest urban agglomeration",
      value: (bySlug["tokyo"]?.totalPopulation.value ?? 37_000_000) / 1_000_000,
      suffix: "M",
      decimals: 1,
    },
  ];
}

/**
 * Derive the four floating Hero stats from live WB data.
 */
export async function fetchHeroStats(): Promise<WorldBankHeroStat[]> {
  const datasets = await fetchMultipleCitiesWBData([
    { slug: "tokyo", name: "Tokyo" },
    { slug: "seoul", name: "Seoul" },
    { slug: "shanghai", name: "Shanghai" },
    { slug: "hong-kong", name: "Hong Kong" },
  ]);

  const bySlug: Record<string, WorldBankCityData> = {};
  for (const d of datasets) bySlug[d.citySlug] = d;

  function fmt(n: number | null): string {
    if (n === null) return "N/A";
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    return n.toFixed(1);
  }

  const jpnPop = bySlug["tokyo"]?.totalPopulation;
  const korUrban = bySlug["seoul"]?.urbanPopulationPercent;
  const chnPop = bySlug["shanghai"]?.totalPopulation;
  const hkgDensity = bySlug["hong-kong"]?.populationDensity;

  return [
    {
      label: `Tokyo Agglomeration (${jpnPop?.year ?? "latest"})`,
      value: fmt(jpnPop?.value ?? null),
    },
    {
      label: `Seoul City (${korUrban?.year ?? "latest"})`,
      value: fmt(korUrban?.value ?? null),
    },
    {
      label: `Shanghai Agglomeration (${chnPop?.year ?? "latest"})`,
      value: fmt(chnPop?.value ?? null),
    },
    {
      label: `Hong Kong Density (${hkgDensity?.year ?? "latest"})`,
      value:
        hkgDensity?.value != null
          ? `${hkgDensity.value.toFixed(0)}/km²`
          : "N/A",
    },
  ];
}
