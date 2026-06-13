from sqlalchemy import String, Boolean, Integer, Numeric, Text, TIMESTAMP, ForeignKey, UniqueConstraint, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
import uuid
from app.database import Base


class City(Base):
    __tablename__ = "cities"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    country: Mapped[str] = mapped_column(String(100), nullable=False)
    country_code: Mapped[str] = mapped_column(String(3), nullable=False)
    region: Mapped[str] = mapped_column(String(100))
    latitude: Mapped[float] = mapped_column(Numeric(10, 7), nullable=False)
    longitude: Mapped[float] = mapped_column(Numeric(10, 7), nullable=False)
    is_megacity: Mapped[bool] = mapped_column(Boolean, default=False)
    city_tier: Mapped[int] = mapped_column(Integer)
    description: Mapped[str] = mapped_column(Text)
    thumbnail_url: Mapped[str | None] = mapped_column(String(500))
    created_at = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

    population_data: Mapped[list["PopulationData"]] = relationship(back_populates="city", lazy="selectin")
    demographic_data: Mapped[list["DemographicData"]] = relationship(back_populates="city", lazy="selectin")
    housing_data: Mapped[list["HousingData"]] = relationship(back_populates="city", lazy="selectin")
    economic_data: Mapped[list["EconomicData"]] = relationship(back_populates="city", lazy="selectin")
    migration_data: Mapped[list["MigrationData"]] = relationship(back_populates="city", lazy="selectin")
    scores: Mapped[list["CityScore"]] = relationship(back_populates="city", lazy="selectin")


class PopulationData(Base):
    __tablename__ = "population_data"
    __table_args__ = (UniqueConstraint("city_id", "year"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    city_id: Mapped[str] = mapped_column(String(36), ForeignKey("cities.id", ondelete="CASCADE"))
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    total_population: Mapped[int] = mapped_column(Integer, nullable=False)
    urban_population: Mapped[int | None] = mapped_column(Integer)
    population_density: Mapped[float | None] = mapped_column(Numeric(10, 2))
    growth_rate: Mapped[float | None] = mapped_column(Numeric(6, 4))
    natural_growth_rate: Mapped[float | None] = mapped_column(Numeric(6, 4))
    net_migration_rate: Mapped[float | None] = mapped_column(Numeric(6, 4))
    data_source: Mapped[str | None] = mapped_column(String(200))
    confidence_level: Mapped[str] = mapped_column(String(20), default="high")

    city: Mapped[City] = relationship(back_populates="population_data")


class DemographicData(Base):
    __tablename__ = "demographic_data"
    __table_args__ = (UniqueConstraint("city_id", "year"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    city_id: Mapped[str] = mapped_column(String(36), ForeignKey("cities.id", ondelete="CASCADE"))
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    age_0_14: Mapped[float | None] = mapped_column(Numeric(5, 2))
    age_15_24: Mapped[float | None] = mapped_column(Numeric(5, 2))
    age_25_64: Mapped[float | None] = mapped_column(Numeric(5, 2))
    age_65_plus: Mapped[float | None] = mapped_column(Numeric(5, 2))
    male_ratio: Mapped[float | None] = mapped_column(Numeric(5, 2))
    female_ratio: Mapped[float | None] = mapped_column(Numeric(5, 2))
    median_age: Mapped[float | None] = mapped_column(Numeric(4, 1))
    dependency_ratio: Mapped[float | None] = mapped_column(Numeric(6, 2))
    aging_index: Mapped[float | None] = mapped_column(Numeric(6, 2))
    fertility_rate: Mapped[float | None] = mapped_column(Numeric(4, 2))
    life_expectancy: Mapped[float | None] = mapped_column(Numeric(4, 1))
    data_source: Mapped[str | None] = mapped_column(String(200))

    city: Mapped[City] = relationship(back_populates="demographic_data")


class HousingData(Base):
    __tablename__ = "housing_data"
    __table_args__ = (UniqueConstraint("city_id", "year", "quarter"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    city_id: Mapped[str] = mapped_column(String(36), ForeignKey("cities.id", ondelete="CASCADE"))
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    quarter: Mapped[int | None] = mapped_column(Integer)
    avg_price_per_sqm: Mapped[float | None] = mapped_column(Numeric(10, 2))
    median_home_price: Mapped[float | None] = mapped_column(Numeric(15, 2))
    avg_rental_monthly: Mapped[float | None] = mapped_column(Numeric(10, 2))
    price_to_income_ratio: Mapped[float | None] = mapped_column(Numeric(6, 2))
    rental_yield: Mapped[float | None] = mapped_column(Numeric(5, 2))
    total_housing_units: Mapped[int | None] = mapped_column(Integer)
    vacancy_rate: Mapped[float | None] = mapped_column(Numeric(5, 2))
    homeownership_rate: Mapped[float | None] = mapped_column(Numeric(5, 2))
    affordability_index: Mapped[float | None] = mapped_column(Numeric(6, 2))
    mortgage_to_income: Mapped[float | None] = mapped_column(Numeric(5, 2))
    data_source: Mapped[str | None] = mapped_column(String(200))

    city: Mapped[City] = relationship(back_populates="housing_data")


class EconomicData(Base):
    __tablename__ = "economic_data"
    __table_args__ = (UniqueConstraint("city_id", "year"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    city_id: Mapped[str] = mapped_column(String(36), ForeignKey("cities.id", ondelete="CASCADE"))
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    gdp_usd_billion: Mapped[float | None] = mapped_column(Numeric(15, 3))
    gdp_per_capita_usd: Mapped[float | None] = mapped_column(Numeric(12, 2))
    gdp_growth_rate: Mapped[float | None] = mapped_column(Numeric(6, 3))
    unemployment_rate: Mapped[float | None] = mapped_column(Numeric(5, 2))
    labor_force_participation: Mapped[float | None] = mapped_column(Numeric(5, 2))
    services_share: Mapped[float | None] = mapped_column(Numeric(5, 2))
    manufacturing_share: Mapped[float | None] = mapped_column(Numeric(5, 2))
    finance_share: Mapped[float | None] = mapped_column(Numeric(5, 2))
    tech_share: Mapped[float | None] = mapped_column(Numeric(5, 2))
    gini_coefficient: Mapped[float | None] = mapped_column(Numeric(4, 3))
    median_household_income: Mapped[float | None] = mapped_column(Numeric(12, 2))
    avg_monthly_wage_usd: Mapped[float | None] = mapped_column(Numeric(10, 2))
    data_source: Mapped[str | None] = mapped_column(String(200))

    city: Mapped[City] = relationship(back_populates="economic_data")


class MigrationData(Base):
    __tablename__ = "migration_data"
    __table_args__ = (UniqueConstraint("city_id", "year"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    city_id: Mapped[str] = mapped_column(String(36), ForeignKey("cities.id", ondelete="CASCADE"))
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    net_migration: Mapped[int | None] = mapped_column(Integer)
    immigration_count: Mapped[int | None] = mapped_column(Integer)
    emigration_count: Mapped[int | None] = mapped_column(Integer)
    internal_migration_in: Mapped[int | None] = mapped_column(Integer)
    internal_migration_out: Mapped[int | None] = mapped_column(Integer)
    international_immigration: Mapped[int | None] = mapped_column(Integer)
    international_emigration: Mapped[int | None] = mapped_column(Integer)
    top_origin_countries: Mapped[dict | None] = mapped_column(JSON)
    top_destination_countries: Mapped[dict | None] = mapped_column(JSON)
    migrant_share: Mapped[float | None] = mapped_column(Numeric(5, 2))
    data_source: Mapped[str | None] = mapped_column(String(200))

    city: Mapped[City] = relationship(back_populates="migration_data")


class CityScore(Base):
    __tablename__ = "city_scores"
    __table_args__ = (UniqueConstraint("city_id", "year"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    city_id: Mapped[str] = mapped_column(String(36), ForeignKey("cities.id", ondelete="CASCADE"))
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    housing_pressure_score: Mapped[float | None] = mapped_column(Numeric(5, 2))
    aging_severity_score: Mapped[float | None] = mapped_column(Numeric(5, 2))
    economic_dynamism_score: Mapped[float | None] = mapped_column(Numeric(5, 2))
    migration_pressure_score: Mapped[float | None] = mapped_column(Numeric(5, 2))
    overall_transformation_score: Mapped[float | None] = mapped_column(Numeric(5, 2))
    computed_at = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())

    city: Mapped[City] = relationship(back_populates="scores")


class AIInsight(Base):
    __tablename__ = "ai_insights"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    city_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("cities.id", ondelete="CASCADE"))
    comparison_key: Mapped[str | None] = mapped_column(String(500))
    insight_type: Mapped[str] = mapped_column(String(50), nullable=False)
    prompt_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    model_version: Mapped[str | None] = mapped_column(String(50))
    tokens_used: Mapped[int | None] = mapped_column(Integer)
    is_valid: Mapped[bool] = mapped_column(Boolean, default=True)
    generated_at = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())
    expires_at = mapped_column(TIMESTAMP(timezone=True))
