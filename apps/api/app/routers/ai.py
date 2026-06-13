from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.city import City, AIInsight
from app.schemas.city import AIAnalyzeRequest
from app.services.ai_service import stream_city_analysis, generate_city_analysis, _make_cache_key
from app.routers.cities import get_city_dashboard
from datetime import datetime, timedelta, timezone
import json

router = APIRouter(prefix="/api/v1/ai", tags=["ai"])


@router.post("/analyze")
async def analyze_city(
    req: AIAnalyzeRequest,
    db: AsyncSession = Depends(get_db),
):
    """Stream AI analysis for a city as Server-Sent Events."""
    # Fetch city dashboard data
    try:
        dashboard = await get_city_dashboard(req.city_slug, db)
    except HTTPException:
        raise

    # Check cache
    prompt_hash = _make_cache_key(req.city_slug, req.custom_query)
    cached = await db.execute(
        select(AIInsight).where(
            AIInsight.prompt_hash == prompt_hash,
            AIInsight.is_valid == True,
            AIInsight.expires_at > datetime.now(timezone.utc),
        )
    )
    existing = cached.scalar_one_or_none()
    if existing:
        async def cached_stream():
            yield existing.content
        return StreamingResponse(cached_stream(), media_type="text/plain")

    # Convert dashboard to dict for AI service
    dashboard_dict = {
        "city": {"name": dashboard["city"].name, "country": dashboard["city"].country},
        "latest_population": {
            "total_population": dashboard["latest_population"].total_population,
            "growth_rate": dashboard["latest_population"].growth_rate or 0,
        },
        "latest_demographics": {
            "median_age": dashboard["latest_demographics"].median_age or 0,
            "fertility_rate": dashboard["latest_demographics"].fertility_rate or 0,
            "age_65_plus": dashboard["latest_demographics"].age_65_plus or 0,
            "aging_index": dashboard["latest_demographics"].aging_index or 0,
        },
        "latest_housing": {
            "avg_price_per_sqm": dashboard["latest_housing"].avg_price_per_sqm or 0,
            "price_to_income_ratio": dashboard["latest_housing"].price_to_income_ratio or 0,
            "affordability_index": dashboard["latest_housing"].affordability_index or 0,
        },
        "latest_economic": {
            "gdp_usd_billion": dashboard["latest_economic"].gdp_usd_billion or 0,
            "gdp_per_capita_usd": dashboard["latest_economic"].gdp_per_capita_usd or 0,
            "gdp_growth_rate": dashboard["latest_economic"].gdp_growth_rate or 0,
            "unemployment_rate": dashboard["latest_economic"].unemployment_rate or 0,
            "services_share": dashboard["latest_economic"].services_share or 0,
            "tech_share": dashboard["latest_economic"].tech_share or 0,
        },
        "latest_migration": {
            "net_migration": dashboard["latest_migration"].net_migration or 0,
            "migrant_share": dashboard["latest_migration"].migrant_share or 0,
        },
        "scores": {
            "housing_pressure_score": dashboard["scores"].housing_pressure_score or 0,
            "aging_severity_score": dashboard["scores"].aging_severity_score or 0,
            "economic_dynamism_score": dashboard["scores"].economic_dynamism_score or 0,
            "overall_transformation_score": dashboard["scores"].overall_transformation_score or 0,
        },
    }

    collected = []

    async def generate_and_cache():
        async for chunk in stream_city_analysis(dashboard_dict, req.custom_query):
            collected.append(chunk)
            yield chunk

        # Save to cache after streaming completes
        full_content = "".join(collected)
        insight = AIInsight(
            city_id=dashboard["city"].id,
            insight_type="city_summary",
            prompt_hash=prompt_hash,
            content=full_content,
            model_version="gpt-4o",
            is_valid=True,
            expires_at=datetime.now(timezone.utc) + timedelta(hours=24),
        )
        db.add(insight)
        await db.commit()

    return StreamingResponse(generate_and_cache(), media_type="text/plain")


@router.get("/insights/{city_slug}")
async def get_cached_insight(city_slug: str, db: AsyncSession = Depends(get_db)):
    """Return cached AI insight for a city if available."""
    city_result = await db.execute(select(City).where(City.slug == city_slug))
    city = city_result.scalar_one_or_none()
    if not city:
        raise HTTPException(404, "City not found")

    insight_result = await db.execute(
        select(AIInsight).where(
            AIInsight.city_id == city.id,
            AIInsight.insight_type == "city_summary",
            AIInsight.is_valid == True,
            AIInsight.expires_at > datetime.now(timezone.utc),
        ).order_by(AIInsight.generated_at.desc()).limit(1)
    )
    insight = insight_result.scalar_one_or_none()
    if not insight:
        raise HTTPException(404, "No cached insight available")
    return {"content": insight.content, "generated_at": str(insight.generated_at)}
