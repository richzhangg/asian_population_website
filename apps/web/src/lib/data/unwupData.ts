/**
 * UN World Urbanization Prospects 2022 — urban agglomeration data.
 * Source: United Nations, Department of Economic and Social Affairs,
 * Population Division (2022). World Urbanization Prospects 2022.
 *
 * populationSeries: population of the urban agglomeration in thousands.
 * Five-year anchor points; annual values are interpolated by fetchCityData.
 * areaSqKm: area used for density calculation (city/prefecture level).
 */

interface UNWUPEntry {
  agglomerationName: string;
  countryName: string;
  countryCode: string;
  areaSqKm: number;
  populationSeries: Array<{ year: number; value: number }>; // thousands
}

export const UN_WUP: Record<string, UNWUPEntry> = {
  tokyo: {
    agglomerationName: "Tokyo",
    countryName: "Japan",
    countryCode: "JPN",
    areaSqKm: 2194, // Tokyo Metropolis (Tokyo-to)
    populationSeries: [
      { year: 1990, value: 32530 },
      { year: 1995, value: 33587 },
      { year: 2000, value: 34450 },
      { year: 2005, value: 35622 },
      { year: 2010, value: 36834 },
      { year: 2015, value: 37750 },
      { year: 2020, value: 37435 },
      { year: 2025, value: 36933 },
      { year: 2030, value: 36014 },
    ],
  },
  seoul: {
    agglomerationName: "Seoul",
    countryName: "South Korea",
    countryCode: "KOR",
    areaSqKm: 605,   // Seoul Special Metropolitan City
    populationSeries: [
      { year: 1990, value: 10522 },
      { year: 1995, value: 9862 },
      { year: 2000, value: 9917 },
      { year: 2005, value: 9592 },
      { year: 2010, value: 9775 },
      { year: 2015, value: 9859 },
      { year: 2020, value: 9967 },
      { year: 2025, value: 9992 },
      { year: 2030, value: 9959 },
    ],
  },
  shanghai: {
    agglomerationName: "Shanghai",
    countryName: "China",
    countryCode: "CHN",
    areaSqKm: 6341,  // Shanghai municipality built-up area
    populationSeries: [
      { year: 1990, value: 7823 },
      { year: 1995, value: 10099 },
      { year: 2000, value: 13243 },
      { year: 2005, value: 15789 },
      { year: 2010, value: 20218 },
      { year: 2015, value: 23741 },
      { year: 2020, value: 28517 },
      { year: 2025, value: 29939 },
      { year: 2030, value: 30986 },
    ],
  },
  "hong-kong": {
    agglomerationName: "Hong Kong",
    countryName: "Hong Kong SAR",
    countryCode: "HKG",
    areaSqKm: 1106,  // Hong Kong total area
    populationSeries: [
      { year: 1990, value: 5888 },
      { year: 1995, value: 6315 },
      { year: 2000, value: 6587 },
      { year: 2005, value: 6786 },
      { year: 2010, value: 7047 },
      { year: 2015, value: 7291 },
      { year: 2020, value: 7501 },
      { year: 2025, value: 7674 },
      { year: 2030, value: 7823 },
    ],
  },
};

/** Linearly interpolate annual population values from 5-year anchor points. */
export function interpolateAnnual(
  series: Array<{ year: number; value: number }>,
  startYear = 1990,
  endYear = 2025
): Array<{ year: number; value: number }> {
  const sorted = [...series].sort((a, b) => a.year - b.year);
  const result: Array<{ year: number; value: number }> = [];

  for (let y = startYear; y <= endYear; y++) {
    const exact = sorted.find((p) => p.year === y);
    if (exact) {
      result.push({ year: y, value: Math.round(exact.value * 1000) });
      continue;
    }
    const before = [...sorted].reverse().find((p) => p.year < y);
    const after = sorted.find((p) => p.year > y);
    if (before && after) {
      const t = (y - before.year) / (after.year - before.year);
      const interpolated = before.value + t * (after.value - before.value);
      result.push({ year: y, value: Math.round(interpolated * 1000) });
    }
  }

  return result;
}

/** Get the population value closest to a target year, or the most recent available. */
export function getPopAtYear(
  annualSeries: Array<{ year: number; value: number }>,
  targetYear?: number
): { value: number; year: number } | null {
  if (!annualSeries.length) return null;
  if (!targetYear) return annualSeries[annualSeries.length - 1];
  const match = annualSeries.find((p) => p.year === targetYear);
  if (match) return match;
  // Return the closest year ≤ targetYear
  const before = [...annualSeries].reverse().find((p) => p.year <= targetYear);
  return before ?? annualSeries[annualSeries.length - 1];
}
