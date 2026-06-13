from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.database import get_db
from app.models.city import City, PopulationData, DemographicData, HousingData, EconomicData, MigrationData, CityScore
from app.schemas.city import CityOut, CityDashboardOut

router = APIRouter(prefix="/api/v1/cities", tags=["cities"])


@router.get("", response_model=list[CityOut])
async def list_cities(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(City).order_by(City.name))
    return result.scalars().all()


@router.get("/search", response_model=dict)
async def search_cities(
    q: str = Query(..., min_length=2),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(City).where(
            or_(
                City.name.ilike(f"%{q}%"),
                City.country.ilike(f"%{q}%"),
                City.region.ilike(f"%{q}%"),
            )
        ).limit(10)
    )
    cities = result.scalars().all()
    return {"cities": cities, "total": len(cities), "query": q}


@router.get("/{slug}", response_model=CityOut)
async def get_city(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(City).where(City.slug == slug))
    city = result.scalar_one_or_none()
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
    return city


@router.get("/{slug}/population")
async def get_population(slug: str, db: AsyncSession = Depends(get_db)):
    city = await _get_city_or_404(slug, db)
    result = await db.execute(
        select(PopulationData)
        .where(PopulationData.city_id == city.id)
        .order_by(PopulationData.year.desc())
    )
    return result.scalars().all()


@router.get("/{slug}/dashboard", response_model=CityDashboardOut)
async def get_city_dashboard(slug: str, db: AsyncSession = Depends(get_db)):
    city = await _get_city_or_404(slug, db)

    latest_pop = await _get_latest(db, PopulationData, city.id)
    latest_demo = await _get_latest(db, DemographicData, city.id)
    latest_house = await _get_latest(db, HousingData, city.id)
    latest_econ = await _get_latest(db, EconomicData, city.id)
    latest_mig = await _get_latest(db, MigrationData, city.id)
    latest_score = await _get_latest(db, CityScore, city.id)

    if not all([latest_pop, latest_demo, latest_house, latest_econ, latest_mig]):
        raise HTTPException(status_code=404, detail="Incomplete city data")

    pop_history = (await db.execute(
        select(PopulationData).where(PopulationData.city_id == city.id).order_by(PopulationData.year)
    )).scalars().all()

    house_history = (await db.execute(
        select(HousingData).where(HousingData.city_id == city.id).order_by(HousingData.year)
    )).scalars().all()

    econ_history = (await db.execute(
        select(EconomicData).where(EconomicData.city_id == city.id).order_by(EconomicData.year)
    )).scalars().all()

    return {
        "city": city,
        "latest_population": latest_pop,
        "latest_demographics": latest_demo,
        "latest_housing": latest_house,
        "latest_economic": latest_econ,
        "latest_migration": latest_mig,
        "scores": latest_score,
        "population_history": pop_history,
        "housing_history": house_history,
        "economic_history": econ_history,
    }


async def _get_city_or_404(slug: str, db: AsyncSession) -> City:
    result = await db.execute(select(City).where(City.slug == slug))
    city = result.scalar_one_or_none()
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
    return city


async def _get_latest(db: AsyncSession, model, city_id: str):
    result = await db.execute(
        select(model)
        .where(model.city_id == city_id)
        .order_by(model.year.desc())
        .limit(1)
    )
    return result.scalar_one_or_none()
