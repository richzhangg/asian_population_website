import type {
  WorldBankCityData,
  WorldBankEconomicData,
  WorldBankIndicatorValue,
  WorldBankHomeStat,
  WorldBankHeroStat,
} from "@/types/worldbank";

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

async function fetchIndicator(
  countryCode: string,
  indicatorId: string,
  dateRange?: DateRange
): Promise<IndicatorResult> {
  const { dateParam, perPage } = buildDateParam(dateRange);
  const url = `${WB_BASE}/country/${countryCode}/indicator/${indicatorId}?format=json&${dateParam}&per_page=${perPage}`;

  const res = await fetch(url, {
    next: { revalidate: 86400 },
    headers: { Accept: "application/json" },
  });

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
    const res = await fetch(url, {
      next: { revalidate: 86400 },
      headers: { Accept: "application/json" },
    });
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
  return fetchHistory(countryCode, WB_INDICATORS.GDP, dateRange);
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetch all four World Bank indicators + population history for a single city.
 * Throws if the city slug has no WB country code mapping.
 */
export async function fetchCityWorldBankData(
  citySlug: string,
  cityName: string,
  dateRange?: DateRange
): Promise<WorldBankCityData> {
  const countryCode = CITY_COUNTRY_MAP[citySlug];
  if (!countryCode) {
    throw new Error(`No World Bank country mapping for city: ${citySlug}`);
  }

  const [
    popResult,
    densityResult,
    urbanResult,
    urbanPctResult,
    history,
    gdpResult,
    gdpPerCapitaResult,
    gdpGrowthResult,
    unemploymentResult,
    inflationResult,
    gdpHistory,
  ] = await Promise.all([
    fetchIndicator(countryCode, WB_INDICATORS.TOTAL_POPULATION, dateRange),
    fetchIndicator(countryCode, WB_INDICATORS.POPULATION_DENSITY, dateRange),
    fetchIndicator(countryCode, WB_INDICATORS.URBAN_POPULATION, dateRange),
    fetchIndicator(countryCode, WB_INDICATORS.URBAN_POPULATION_PCT, dateRange),
    fetchPopulationHistory(countryCode, dateRange),
    fetchIndicator(countryCode, WB_INDICATORS.GDP, dateRange),
    fetchIndicator(countryCode, WB_INDICATORS.GDP_PER_CAPITA, dateRange),
    fetchIndicator(countryCode, WB_INDICATORS.GDP_GROWTH, dateRange),
    fetchIndicator(countryCode, WB_INDICATORS.UNEMPLOYMENT, dateRange),
    fetchIndicator(countryCode, WB_INDICATORS.INFLATION, dateRange),
    fetchGdpHistory(countryCode, dateRange),
  ]);

  const economicData: WorldBankEconomicData = {
    gdp: gdpResult.data,
    gdpPerCapita: gdpPerCapitaResult.data,
    gdpGrowth: gdpGrowthResult.data,
    unemployment: unemploymentResult.data,
    inflation: inflationResult.data,
    gdpHistory,
  };

  return {
    citySlug,
    cityName,
    countryCode,
    countryName: popResult.countryName,
    totalPopulation: popResult.data,
    populationDensity: densityResult.data,
    urbanPopulation: urbanResult.data,
    urbanPopulationPercent: urbanPctResult.data,
    populationHistory: history,
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
      label: "People Across 4 Tracked Economies",
      sub: "Japan · South Korea · China · Hong Kong",
      value: totalPop / 1_000_000_000,
      suffix: "B",
      decimals: 2,
    },
    {
      label: "Hong Kong Urbanization Rate",
      sub: "Most urbanized economy tracked",
      value: hkgUrban,
      suffix: "%",
      decimals: 1,
    },
    {
      label: "China Total Population",
      sub: "Largest economy tracked",
      value: chnPop / 1_000_000_000,
      suffix: "B",
      decimals: 2,
    },
    {
      label: "Japan Population Density",
      sub: "People per km² of land area",
      value: jpnDensity,
      suffix: "/km²",
      decimals: 0,
    },
    {
      label: "South Korea Urban Population",
      sub: "Share of total population",
      value: korUrban,
      suffix: "%",
      decimals: 1,
    },
    {
      label: "Hong Kong Population Density",
      sub: "People per km² of land area",
      value: hkgDensity,
      suffix: "/km²",
      decimals: 0,
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
      label: `Japan Population (${jpnPop?.year ?? "latest"})`,
      value: fmt(jpnPop?.value ?? null),
    },
    {
      label: `South Korea Urban % (${korUrban?.year ?? "latest"})`,
      value: korUrban?.value != null ? `${korUrban.value.toFixed(1)}%` : "N/A",
    },
    {
      label: `China Population (${chnPop?.year ?? "latest"})`,
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
