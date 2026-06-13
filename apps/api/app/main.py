from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from loguru import logger

from app.config import settings
from app.database import engine, Base
from app.routers import cities, ai, compare


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting AUTM API [{settings.environment}]")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()
    logger.info("AUTM API shutdown complete")


app = FastAPI(
    title="Asian Urban Transformation Matrix API",
    description="Research API for Asian city demographics, housing, and economic data.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── Middleware ────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

# ── Routers ───────────────────────────────────────────────────────────────────

app.include_router(cities.router)
app.include_router(ai.router)
app.include_router(compare.router)


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/health", tags=["system"])
async def health():
    return {"status": "ok", "version": "1.0.0", "environment": settings.environment}


@app.get("/", tags=["system"])
async def root():
    return {
        "name": "Asian Urban Transformation Matrix API",
        "version": "1.0.0",
        "docs": "/docs",
    }
