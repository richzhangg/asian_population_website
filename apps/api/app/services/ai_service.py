import hashlib
import json
from typing import AsyncGenerator
from openai import AsyncOpenAI
from app.config import settings

client = AsyncOpenAI(api_key=settings.openai_api_key)

SYSTEM_PROMPT = """You are a senior urban economist and demographer specializing in Asian cities.
You have deep expertise in:
- Urban demographic transitions (fertility, aging, migration)
- Asian housing market mechanics (jeonse, hukou, land value tax)
- Economic geography and agglomeration theory
- City-level policy analysis

When analyzing a city, you:
1. Lead with the key paradox or tension in the data
2. Explain WHY counterintuitive patterns occur (not just WHAT)
3. Cite specific data points by name (e.g., "fertility rate of 0.72")
4. Draw connections across demographics, housing, and economic data
5. Identify 1–2 critical inflection points in the next 5–10 years
6. Use **bold** for key terms and statistics

Write in a research-grade but accessible tone. 400–600 words. No bullet points for main analysis — use flowing prose with clear paragraph breaks."""


def _build_city_prompt(city_data: dict, custom_query: str | None = None) -> str:
    base = f"""Analyze {city_data['city']['name']}, {city_data['city']['country']}.

CURRENT DATA (2024):
- Population: {city_data['latest_population']['total_population']:,} | Growth: {city_data['latest_population']['growth_rate']:+.2f}%/yr
- Median Age: {city_data['latest_demographics']['median_age']} years | Fertility: {city_data['latest_demographics']['fertility_rate']} births/woman
- Age 65+: {city_data['latest_demographics']['age_65_plus']}% | Aging Index: {city_data['latest_demographics']['aging_index']}
- Housing: ${city_data['latest_housing']['avg_price_per_sqm']:,}/m² | Price-to-Income: {city_data['latest_housing']['price_to_income_ratio']}x
- Affordability Index: {city_data['latest_housing']['affordability_index']}/100
- GDP: ${city_data['latest_economic']['gdp_usd_billion']:.0f}B | GDP/Capita: ${city_data['latest_economic']['gdp_per_capita_usd']:,.0f}
- GDP Growth: {city_data['latest_economic']['gdp_growth_rate']:+.1f}% | Unemployment: {city_data['latest_economic']['unemployment_rate']}%
- Services: {city_data['latest_economic']['services_share']}% | Tech: {city_data['latest_economic']['tech_share']}%
- Net Migration: {city_data['latest_migration']['net_migration']:+,} | Migrant Share: {city_data['latest_migration']['migrant_share']}%

TRANSFORMATION SCORES:
- Housing Pressure: {city_data['scores']['housing_pressure_score']}/100
- Aging Severity: {city_data['scores']['aging_severity_score']}/100
- Economic Dynamism: {city_data['scores']['economic_dynamism_score']}/100
- Overall Transformation: {city_data['scores']['overall_transformation_score']}/100
"""

    if custom_query:
        base += f"\n\nFOCUS QUESTION: {custom_query}"
    else:
        base += f"\n\nProvide a comprehensive urban transformation analysis for {city_data['city']['name']}."

    return base


def _make_cache_key(city_slug: str, custom_query: str | None) -> str:
    raw = f"{city_slug}:{custom_query or ''}:v1"
    return hashlib.sha256(raw.encode()).hexdigest()


async def stream_city_analysis(
    city_data: dict,
    custom_query: str | None = None,
) -> AsyncGenerator[str, None]:
    prompt = _build_city_prompt(city_data, custom_query)

    stream = await client.chat.completions.create(
        model=settings.openai_model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        max_tokens=settings.openai_max_tokens,
        temperature=0.7,
        stream=True,
    )

    async for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta


async def generate_city_analysis(city_data: dict, custom_query: str | None = None) -> str:
    prompt = _build_city_prompt(city_data, custom_query)
    response = await client.chat.completions.create(
        model=settings.openai_model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        max_tokens=settings.openai_max_tokens,
        temperature=0.7,
    )
    return response.choices[0].message.content or ""
