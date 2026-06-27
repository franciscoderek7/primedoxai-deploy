"""
backend/main.py

FastAPI skeleton for the FloorManager runtime — GET-only, no WebSockets,
no Timmy/Floor-9 logic, no auth yet. Backend is the single source of
truth; the frontend never invents floor state, it always fetches.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import floors, health

app = FastAPI(title="Francisco Holdings Skyscraper API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://franciscoholdingsinc.com",
        "https://omniaguard.com",
        "https://primedoxai.com",
        "https://ccldr.net",
        "http://localhost:3000",
        "http://localhost:8080",
    ],
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(floors.router, prefix="/api")
app.include_router(health.router)
