export interface City {
  id: string;
  name: string;
  slug: string;
  country: string;
  countryCode: string;
  region: string;
  latitude: number;
  longitude: number;
  isMegacity: boolean;
  cityTier: 1 | 2 | 3;
  description: string;
  thumbnailUrl?: string;
}

export interface PopulationData {
  cityId: string;
  year: number;
  totalPopulation: number;
  urbanPopulation: number;
  populationDensity: number;
  growthRate: number;
  naturalGrowthRate: number;
  netMigrationRate: number;
  dataSource: string;
  confidenceLevel: "high" | "medium" | "low";
}

export interface DemographicData {
  cityId: string;
  year: number;
  age0to14: number;
  age15to24: number;
  age25to64: number;
  age65plus: number;
  maleRatio: number;
  femaleRatio: number;
  medianAge: number;
  dependencyRatio: number;
  agingIndex: number;
  fertilityRate: number;
  lifeExpectancy: number;
}

export interface HousingData {
  cityId: string;
  year: number;
  quarter?: number;
  avgPricePerSqm: number;
  medianHomePrice: number;
  avgRentalMonthly: number;
  priceToIncomeRatio: number;
  rentalYield: number;
  totalHousingUnits: number;
  vacancyRate: number;
  homeownershipRate: number;
  affordabilityIndex: number;
  mortgageToIncome: number;
}

export interface EconomicData {
  cityId: string;
  year: number;
  gdpUsdBillion: number;
  gdpPerCapitaUsd: number;
  gdpGrowthRate: number;
  unemploymentRate: number;
  laborForceParticipation: number;
  servicesShare: number;
  manufacturingShare: number;
  financeShare: number;
  techShare: number;
  giniCoefficient: number;
  medianHouseholdIncome: number;
  avgMonthlyWageUsd: number;
}

export interface MigrationData {
  cityId: string;
  year: number;
  netMigration: number;
  immigrationCount: number;
  emigrationCount: number;
  internalMigrationIn: number;
  internalMigrationOut: number;
  internationalImmigration: number;
  internationalEmigration: number;
  topOriginCountries: { country: string; count: number }[];
  topDestinationCountries: { country: string; count: number }[];
  migrantShare: number;
}

export interface CityScores {
  cityId: string;
  year: number;
  housingPressureScore: number;
  agingSeverityScore: number;
  economicDynamismScore: number;
  migrationPressureScore: number;
  overallTransformationScore: number;
}

export interface CityDashboard {
  city: City;
  latestPopulation: PopulationData;
  latestDemographics: DemographicData;
  latestHousing: HousingData;
  latestEconomic: EconomicData;
  latestMigration: MigrationData;
  scores: CityScores;
  populationHistory: PopulationData[];
  housingHistory: HousingData[];
  economicHistory: EconomicData[];
}

export interface ComparisonMetric {
  label: string;
  key: string;
  unit: string;
  format: "number" | "percentage" | "currency" | "score";
  higherIsBetter?: boolean;
}

export interface ComparisonRow {
  metric: ComparisonMetric;
  values: Record<string, number | null>;
  best: string;
  worst: string;
}

export interface ComparisonMatrix {
  cities: City[];
  rows: ComparisonRow[];
  generatedAt: string;
}

export interface AIInsight {
  id: string;
  cityId?: string;
  comparisonKey?: string;
  insightType: "city_summary" | "comparison" | "trend" | "custom";
  content: string;
  modelVersion: string;
  generatedAt: string;
  expiresAt: string;
}

export interface SearchResult {
  cities: City[];
  total: number;
  query: string;
}

export type TrendDirection = "up" | "down" | "stable";

export interface TrendIndicator {
  value: number;
  change: number;
  changePercent: number;
  direction: TrendDirection;
  period: string;
}
