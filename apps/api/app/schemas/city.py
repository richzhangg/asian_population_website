from pydantic import BaseModel, Field
from typing import Any


class CityOut(BaseModel):
    id: str
    name: str
    slug: str
    country: str
    country_code: str
    region: str
    latitude: float
    longitude: float
    is_megacity: bool
    city_tier: int
    description: str
    thumbnail_url: str | None = None

    model_config = {"from_attributes": True}


class PopulationDataOut(BaseModel):
    city_id: str
    year: int
    total_population: int
    urban_population: int | None = None
    population_density: float | None = None
    growth_rate: float | None = None
    natural_growth_rate: float | None = None
    net_migration_rate: float | None = None
    data_source: str | None = None
    confidence_level: str = "high"

    model_config = {"from_attributes": True}


class DemographicDataOut(BaseModel):
    city_id: str
    year: int
    age_0_14: float | None = None
    age_15_24: float | None = None
    age_25_64: float | None = None
    age_65_plus: float | None = None
    male_ratio: float | None = None
    female_ratio: float | None = None
    median_age: float | None = None
    dependency_ratio: float | None = None
    aging_index: float | None = None
    fertility_rate: float | None = None
    life_expectancy: float | None = None

    model_config = {"from_attributes": True}


class HousingDataOut(BaseModel):
    city_id: str
    year: int
    quarter: int | None = None
    avg_price_per_sqm: float | None = None
    median_home_price: float | None = None
    avg_rental_monthly: float | None = None
    price_to_income_ratio: float | None = None
    rental_yield: float | None = None
    total_housing_units: int | None = None
    vacancy_rate: float | None = None
    homeownership_rate: float | None = None
    affordability_index: float | None = None
    mortgage_to_income: float | None = None

    model_config = {"from_attributes": True}


class EconomicDataOut(BaseModel):
    city_id: str
    year: int
    gdp_usd_billion: float | None = None
    gdp_per_capita_usd: float | None = None
    gdp_growth_rate: float | None = None
    unemployment_rate: float | None = None
    labor_force_participation: float | None = None
    services_share: float | None = None
    manufacturing_share: float | None = None
    finance_share: float | None = None
    tech_share: float | None = None
    gini_coefficient: float | None = None
    median_household_income: float | None = None
    avg_monthly_wage_usd: float | None = None

    model_config = {"from_attributes": True}


class MigrationDataOut(BaseModel):
    city_id: str
    year: int
    net_migration: int | None = None
    immigration_count: int | None = None
    emigration_count: int | None = None
    internal_migration_in: int | None = None
    internal_migration_out: int | None = None
    international_immigration: int | None = None
    international_emigration: int | None = None
    top_origin_countries: list[Any] | None = None
    top_destination_countries: list[Any] | None = None
    migrant_share: float | None = None

    model_config = {"from_attributes": True}


class CityScoreOut(BaseModel):
    city_id: str
    year: int
    housing_pressure_score: float | None = None
    aging_severity_score: float | None = None
    economic_dynamism_score: float | None = None
    migration_pressure_score: float | None = None
    overall_transformation_score: float | None = None

    model_config = {"from_attributes": True}


class CityDashboardOut(BaseModel):
    city: CityOut
    latest_population: PopulationDataOut
    latest_demographics: DemographicDataOut
    latest_housing: HousingDataOut
    latest_economic: EconomicDataOut
    latest_migration: MigrationDataOut
    scores: CityScoreOut
    population_history: list[PopulationDataOut]
    housing_history: list[HousingDataOut]
    economic_history: list[EconomicDataOut]


class CompareRequest(BaseModel):
    city_slugs: list[str] = Field(..., min_length=2, max_length=4)


class AIAnalyzeRequest(BaseModel):
    city_slug: str
    custom_query: str | None = None


class AIInsightOut(BaseModel):
    id: str
    city_id: str | None = None
    insight_type: str
    content: str
    model_version: str | None = None
    generated_at: str
