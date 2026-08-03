export interface WorldBankIndicatorValue {
  indicatorId: string;
  indicatorName: string;
  value: number | null;
  year: number | null;
}

export interface WorldBankEconomicData {
  gdp: WorldBankIndicatorValue;
  gdpPerCapita: WorldBankIndicatorValue;
  gdpGrowth: WorldBankIndicatorValue;
  unemployment: WorldBankIndicatorValue;
  inflation: WorldBankIndicatorValue;
  gdpHistory: Array<{ year: number; value: number }>;
}

export interface WorldBankCityData {
  citySlug: string;
  cityName: string;
  countryCode: string;
  countryName: string;
  areaSqKm: number;
  totalPopulation: WorldBankIndicatorValue;
  populationDensity: WorldBankIndicatorValue;
  urbanPopulation: WorldBankIndicatorValue;
  urbanPopulationPercent: WorldBankIndicatorValue;
  populationHistory: Array<{ year: number; value: number }>;
  economicData: WorldBankEconomicData;
  fetchedAt: string;
}

export interface WorldBankHomeStat {
  label: string;
  sub: string;
  value: number;
  suffix: string;
  prefix?: string;
  decimals: number;
}

export interface WorldBankHeroStat {
  label: string;
  value: string;
}
