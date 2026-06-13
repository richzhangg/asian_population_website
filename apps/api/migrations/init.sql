-- ============================================================
-- Asian Urban Transformation Matrix — PostgreSQL Schema
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Cities ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cities (
    id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name            VARCHAR(100) NOT NULL,
    slug            VARCHAR(100) UNIQUE NOT NULL,
    country         VARCHAR(100) NOT NULL,
    country_code    CHAR(3)      NOT NULL,
    region          VARCHAR(100),
    latitude        NUMERIC(10, 7) NOT NULL,
    longitude       NUMERIC(10, 7) NOT NULL,
    is_megacity     BOOLEAN DEFAULT false,
    city_tier       INTEGER CHECK (city_tier BETWEEN 1 AND 3),
    description     TEXT,
    thumbnail_url   VARCHAR(500),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Population ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS population_data (
    id                   TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    city_id              TEXT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    year                 INTEGER NOT NULL,
    total_population     BIGINT NOT NULL,
    urban_population     BIGINT,
    population_density   NUMERIC(10, 2),
    growth_rate          NUMERIC(6, 4),
    natural_growth_rate  NUMERIC(6, 4),
    net_migration_rate   NUMERIC(6, 4),
    data_source          VARCHAR(200),
    confidence_level     VARCHAR(20) DEFAULT 'high',
    UNIQUE (city_id, year)
);

-- ── Demographics ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS demographic_data (
    id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    city_id          TEXT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    year             INTEGER NOT NULL,
    age_0_14         NUMERIC(5, 2),
    age_15_24        NUMERIC(5, 2),
    age_25_64        NUMERIC(5, 2),
    age_65_plus      NUMERIC(5, 2),
    male_ratio       NUMERIC(5, 2),
    female_ratio     NUMERIC(5, 2),
    median_age       NUMERIC(4, 1),
    dependency_ratio NUMERIC(6, 2),
    aging_index      NUMERIC(6, 2),
    fertility_rate   NUMERIC(4, 2),
    life_expectancy  NUMERIC(4, 1),
    data_source      VARCHAR(200),
    UNIQUE (city_id, year)
);

-- ── Housing ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS housing_data (
    id                   TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    city_id              TEXT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    year                 INTEGER NOT NULL,
    quarter              INTEGER CHECK (quarter BETWEEN 1 AND 4),
    avg_price_per_sqm    NUMERIC(10, 2),
    median_home_price    NUMERIC(15, 2),
    avg_rental_monthly   NUMERIC(10, 2),
    price_to_income_ratio NUMERIC(6, 2),
    rental_yield         NUMERIC(5, 2),
    total_housing_units  BIGINT,
    vacancy_rate         NUMERIC(5, 2),
    homeownership_rate   NUMERIC(5, 2),
    affordability_index  NUMERIC(6, 2),
    mortgage_to_income   NUMERIC(5, 2),
    data_source          VARCHAR(200),
    UNIQUE (city_id, year, quarter)
);

-- ── Economic ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS economic_data (
    id                        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    city_id                   TEXT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    year                      INTEGER NOT NULL,
    gdp_usd_billion           NUMERIC(15, 3),
    gdp_per_capita_usd        NUMERIC(12, 2),
    gdp_growth_rate           NUMERIC(6, 3),
    unemployment_rate         NUMERIC(5, 2),
    labor_force_participation NUMERIC(5, 2),
    services_share            NUMERIC(5, 2),
    manufacturing_share       NUMERIC(5, 2),
    finance_share             NUMERIC(5, 2),
    tech_share                NUMERIC(5, 2),
    gini_coefficient          NUMERIC(4, 3),
    median_household_income   NUMERIC(12, 2),
    avg_monthly_wage_usd      NUMERIC(10, 2),
    data_source               VARCHAR(200),
    UNIQUE (city_id, year)
);

-- ── Migration ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS migration_data (
    id                          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    city_id                     TEXT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    year                        INTEGER NOT NULL,
    net_migration               INTEGER,
    immigration_count           INTEGER,
    emigration_count            INTEGER,
    internal_migration_in       INTEGER,
    internal_migration_out      INTEGER,
    international_immigration   INTEGER,
    international_emigration    INTEGER,
    top_origin_countries        JSONB,
    top_destination_countries   JSONB,
    migrant_share               NUMERIC(5, 2),
    data_source                 VARCHAR(200),
    UNIQUE (city_id, year)
);

-- ── City Scores ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS city_scores (
    id                          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    city_id                     TEXT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    year                        INTEGER NOT NULL,
    housing_pressure_score      NUMERIC(5, 2),
    aging_severity_score        NUMERIC(5, 2),
    economic_dynamism_score     NUMERIC(5, 2),
    migration_pressure_score    NUMERIC(5, 2),
    overall_transformation_score NUMERIC(5, 2),
    computed_at                 TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (city_id, year)
);

-- ── AI Insights Cache ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ai_insights (
    id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    city_id         TEXT REFERENCES cities(id) ON DELETE CASCADE,
    comparison_key  VARCHAR(500),
    insight_type    VARCHAR(50) NOT NULL,
    prompt_hash     VARCHAR(64) NOT NULL UNIQUE,
    content         TEXT NOT NULL,
    model_version   VARCHAR(50),
    tokens_used     INTEGER,
    is_valid        BOOLEAN DEFAULT true,
    generated_at    TIMESTAMPTZ DEFAULT NOW(),
    expires_at      TIMESTAMPTZ
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_pop_city_year       ON population_data(city_id, year DESC);
CREATE INDEX IF NOT EXISTS idx_demo_city_year      ON demographic_data(city_id, year DESC);
CREATE INDEX IF NOT EXISTS idx_house_city_year     ON housing_data(city_id, year DESC);
CREATE INDEX IF NOT EXISTS idx_econ_city_year      ON economic_data(city_id, year DESC);
CREATE INDEX IF NOT EXISTS idx_mig_city_year       ON migration_data(city_id, year DESC);
CREATE INDEX IF NOT EXISTS idx_scores_city_year    ON city_scores(city_id, year DESC);
CREATE INDEX IF NOT EXISTS idx_cities_slug         ON cities(slug);
CREATE INDEX IF NOT EXISTS idx_cities_country      ON cities(country_code);
CREATE INDEX IF NOT EXISTS idx_ai_hash             ON ai_insights(prompt_hash);
CREATE INDEX IF NOT EXISTS idx_ai_city             ON ai_insights(city_id);
CREATE INDEX IF NOT EXISTS idx_ai_valid_expires    ON ai_insights(is_valid, expires_at);

-- ── Seed Data ─────────────────────────────────────────────────────────────────

INSERT INTO cities (name, slug, country, country_code, region, latitude, longitude, is_megacity, city_tier, description)
VALUES
    ('Tokyo',     'tokyo',     'Japan',         'JPN', 'East Asia',     35.6762,   139.6503, true,  1, 'The world''s largest metropolitan area, pioneering aging-society urban policy.'),
    ('Seoul',     'seoul',     'South Korea',   'KOR', 'East Asia',     37.5665,   126.9780, true,  1, 'A hyper-connected capital navigating record-low fertility and soaring housing costs.'),
    ('Shanghai',  'shanghai',  'China',         'CHN', 'East Asia',     31.2304,   121.4737, true,  1, 'China''s financial powerhouse undergoing rapid demographic restructuring.'),
    ('Hong Kong', 'hong-kong', 'China (SAR)',   'HKG', 'East Asia',     22.3193,   114.1694, false, 1, 'A global financial hub with some of the world''s most extreme housing unaffordability.'),
    ('Singapore', 'singapore', 'Singapore',     'SGP', 'Southeast Asia', 1.3521,   103.8198, false, 1, 'A city-state model for housing policy and managed migration in Southeast Asia.'),
    ('Bangkok',   'bangkok',   'Thailand',      'THA', 'Southeast Asia', 13.7563,  100.5018, true,  1, 'A primate city absorbing rural-urban migrants while Thailand ages rapidly.'),
    ('Jakarta',   'jakarta',   'Indonesia',     'IDN', 'Southeast Asia', -6.2088,  106.8456, true,  1, 'A sinking megacity being replaced by Nusantara as Indonesia''s capital.'),
    ('Mumbai',    'mumbai',    'India',         'IND', 'South Asia',    19.0760,    72.8777, true,  1, 'India''s financial capital with extreme density, migration pressure and informal housing.'),
    ('Manila',    'manila',    'Philippines',   'PHL', 'Southeast Asia', 14.5995,  120.9842, true,  2, 'One of the world''s densest cities, driven by remittance economics and young demographics.'),
    ('Shenzhen',  'shenzhen',  'China',         'CHN', 'East Asia',     22.5431,   114.0579, true,  1, 'From fishing village to tech megacity in 40 years — the fastest urbanization in history.')
ON CONFLICT (slug) DO NOTHING;
