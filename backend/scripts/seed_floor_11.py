"""
backend/scripts/seed_floor_11.py

One-time setup: marks Floor 11 vacant and rentable at $999/mo so
POST /api/floors/11/apply has something to sell. Idempotent — re-running
it just updates the existing row instead of creating a duplicate.
Floors 1-10 are already occupied and untouched by this script.

Usage:
    python -m backend.scripts.seed_floor_11
"""

from ..core.db import SessionLocal, init_db
from ..db_models.floor_state_db import FloorRow

FLOOR_NUMBER = 11
MONTHLY_RATE_CENTS = 99900  # $999/mo
TIER = "premium"


def main() -> None:
    init_db()
    db = SessionLocal()
    try:
        floor_row = db.query(FloorRow).filter(FloorRow.floor_number == FLOOR_NUMBER).first()
        if not floor_row:
            floor_row = FloorRow(floor_number=FLOOR_NUMBER)
            db.add(floor_row)
            print(f"Floor {FLOOR_NUMBER} created")
        else:
            print(f"Floor {FLOOR_NUMBER} already exists, updating rental terms")

        floor_row.status = "vacant"
        floor_row.tier = TIER
        floor_row.monthly_rate_cents = MONTHLY_RATE_CENTS
        floor_row.billing_status = None
        db.commit()

        print(f"  status              -> vacant")
        print(f"  tier                -> {TIER}")
        print(f"  monthly_rate_cents  -> {MONTHLY_RATE_CENTS}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
