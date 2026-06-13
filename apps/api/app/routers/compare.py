from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.city import City, PopulationData, HousingData, EconomicData, DemographicData, CityScore
from app.schemas.city import CompareRequest

router = APIRouter(prefix="/api/v1/compare", tags=["comparison"])

METRICS = [
    {"label": "Population Growth", "key": "population_growth", "unit": "%/yr", "format": "percentage", "higher_is_better": True},
    {"label": "Housing Pressure", "key": "housing_pressure_score", "unit": "/100", "format": "score", "higher_is_better": False},
    {"label": "Aging Severity", "key": "aging_severity_score", "unit": "/100", "format": "score", "higher_is_better": False},
    {"label": "GDP per Capita", "key": "gdp_per_capita", "unit": "USD", "format": "currency", "higher_is_better": True},
    {"label": "GDP Growth", "key": "gdp_growth", "unit": "%/yr", "format": "percentage", "higher_is_better": True},
    {"label": "Median Age", "key": "median_age", "unit": "years", "format": "number"},
    {"label": "Price-to-Income Ratio", "key": "price_to_income", "unit": "x", "format": "number", "higher_is_better": False},
    {"label": "Fertility Rate", "key": "fertility_rate", "unit": "births/woman", "format": "number", "higher_is_better": True},
    {"label": "Unemployment", "key": "unemployment_rate", "unit": "%", "format": "percentage", "higher_is_better": False},
    {"label": "Migrant Share", "key": "migrant_share", "unit": "%", "format": "percentage"},
]


@router.post("")
async def compare_cities(req: CompareRequest, db: AsyncSession = Depends(get_db)):
    if len(req.city_slugs) < 2:
        raise HTTPException(400, "At least 2 cities required")

    cities = []
    data_map: dict = {}

    for slug in req.city_slugs:
        city_result = await db.execute(select(City).where(City.slug == slug))
        city = city_result.scalar_one_or_none()
        if not city:
            raise HTTPException(404, f"City not found: {slug}")
        cities.append(city)

        pop = (await db.execute(select(PopulationData).where(PopulationData.city_id == city.id).order_by(PopulationData.year.desc()).limit(1))).scalar_one_or_none()
        house = (await db.execute(select(HousingData).where(HousingData.city_id == city.id).order_by(HousingData.year.desc()).limit(1))).scalar_one_or_none()
        econ = (await db.execute(select(EconomicData).where(EconomicData.city_id == city.id).order_by(EconomicData.year.desc()).limit(1))).scalar_one_or_none()
        demo = (await db.execute(select(DemographicData).where(DemographicData.city_id == city.id).order_by(DemographicData.year.desc()).limit(1))).scalar_one_or_none()
        score = (await db.execute(select(CityScore).where(CityScore.city_id == city.id).order_by(CityScore.year.desc()).limit(1))).scalar_one_or_none()

        data_map[slug] = {
            "population_growth": pop.growth_rate if pop else None,
            "housing_pressure_score": score.housing_pressure_score if score else None,
            "aging_severity_score": score.aging_severity_score if score else None,
            "gdp_per_capita": econ.gdp_per_capita_usd if econ else None,
            "gdp_growth": econ.gdp_growth_rate if econ else None,
            "median_age": demo.median_age if demo else None,
            "price_to_income": house.price_to_income_ratio if house else None,
            "fertility_rate": demo.fertility_rate if demo else None,
            "unemployment_rate": econ.unemployment_rate if econ else None,
            "migrant_share": None,  # filled from migration_data table
        }

    rows = []
    for metric in METRICS:
        key = metric["key"]
        values = {slug: data_map[slug].get(key) for slug in req.city_slugs}
        valid = {k: v for k, v in values.items() if v is not None}

        if valid:
            hib = metric.get("higher_is_better", True)
            best = max(valid, key=lambda k: valid[k]) if hib else min(valid, key=lambda k: valid[k])
            worst = min(valid, key=lambda k: valid[k]) if hib else max(valid, key=lambda k: valid[k])
        else:
            best = req.city_slugs[0]
            worst = req.city_slugs[0]

        rows.append({
            "metric": metric,
            "values": values,
            "best": best,
            "worst": worst,
        })

    from datetime import datetime
    return {
        "cities": cities,
        "rows": rows,
        "generated_at": datetime.utcnow().isoformat(),
    }
