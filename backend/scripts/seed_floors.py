"""
backend/scripts/seed_floors.py

Seeds display content (name/description/CTA/theme) for floors 1-11 and
marks Floor 12 vacant and rentable at $999/mo. Idempotent — re-running it
updates existing rows by floor_number instead of creating duplicates.

CTA links use only domains confirmed owned this session. Two corrections
from the original draft:
  - PrimeDox AI (floor 3): primedoxai.com is not yet owned -> GitHub Pages
    URL until it's purchased.
  - CleanSwarm (floor 7): the owned domain is cleanswarm.ca, not .com.

Floors 2/3/8/9 (OmniGuard, PrimeDox AI, Kiaros, Vigilax) are Derek's own
products with their own already-standardized SaaS pricing — they are NOT
floors for rent, so this script deliberately leaves their FloorRow
tier/monthly_rate_cents/billing_status null. Floor 11 (MindShift by
Makayla) is occupied the same way. Only Floor 12 carries real rental
terms.

Usage:
    python -m backend.scripts.seed_floors
"""

from ..core.db import SessionLocal, init_db
from ..db_models.company import Company
from ..db_models.floor_state_db import FloorRow

# OmniGuard is the only brand permitted blue/pink, per CLAUDE.md's 2026-06-19
# rebrand notice (#4A90E2 / #E91E63) — overrides the slightly different cyan
# theme floated in earlier drafts.
OCCUPIED_FLOORS = [
    {
        "floor_number": 1,
        "name": "Francisco Holdings Inc",
        "theme": "#E5E4E2,#FFD700,#C0C0C0",
        "description": "Parent holding company. 45+ subsidiaries. Global empire.",
        "cta_text": "Enter the Empire",
        "cta_link": "https://franciscoholdingsinc.com",
    },
    {
        "floor_number": 2,
        "name": "OmniGuard",
        "theme": "#4A90E2,#E91E63",
        "description": "Cybersecurity for the empire. Threat detection. VPN. Data protection.",
        "cta_text": "Install OmniGuard",
        "cta_link": "https://omniaguard.com",
    },
    {
        "floor_number": 3,
        "name": "PrimeDox AI",
        "theme": "#E5E4E2,#FFD700,#C0C0C0",
        "description": "AI document generation. Legal templates. Automated drafting.",
        "cta_text": "Generate Documents",
        "cta_link": "https://franciscoderek7.github.io/primedoxai",  # primedoxai.com not yet owned
    },
    {
        "floor_number": 4,
        "name": "CCLDR / Weedlaw",
        "theme": "#009246,#FFFFFF,#CE2B37",
        "description": "Canadian Cannabis Legal Defense Resource. Constitutional advocacy.",
        "cta_text": "Learn the Law",
        "cta_link": "https://ccldr.net",
    },
    {
        "floor_number": 5,
        "name": "TechPetCage",
        "theme": "#E5E4E2,#FFD700,#C0C0C0",
        "description": "Smart pet technology. GPS collars. AI cameras. Automated feeders.",
        "cta_text": "Shop Pet Tech",
        "cta_link": "https://techpetcage.com",
    },
    {
        "floor_number": 6,
        "name": "Vault Velocity Auto",
        "theme": "#FFD700,#000000,#C0C0C0",
        "description": "Luxury vehicle brokerage. Supercars. Jets. Yachts. Armored vehicles.",
        "cta_text": "Acquire Luxury",
        "cta_link": "https://vaultvelocityauto.com",
    },
    {
        "floor_number": 7,
        "name": "CleanSwarm",
        "theme": "#00FF00,#FFFFFF,#000000",
        "description": "Autonomous cleaning systems. Robotics. Smart sanitation.",
        "cta_text": "Deploy CleanSwarm",
        "cta_link": "https://cleanswarm.ca",  # cleanswarm.com is not owned
    },
    {
        "floor_number": 8,
        "name": "Kiaros",
        "theme": "#E5E4E2,#FFD700,#C0C0C0",
        "description": "Time optimization platform. Productivity AI. Schedule mastery.",
        "cta_text": "Master Your Time",
        "cta_link": "https://kiaros.com",
    },
    {
        "floor_number": 9,
        "name": "Vigilax",
        "theme": "#FF0000,#000000,#FFFFFF",
        "description": "Surveillance and monitoring systems. Security infrastructure.",
        "cta_text": "Activate Vigilax",
        "cta_link": "https://vigilax.com",
    },
    {
        "floor_number": 10,
        "name": "Reserved",
        "theme": "#E5E4E2,#FFD700,#C0C0C0",
        "description": "Reserved for future empire expansion.",
        "cta_text": "Coming Soon",
        "cta_link": "#",
    },
    {
        "floor_number": 11,
        "name": "MindShift by Makayla",
        "theme": "#800080,#FFD700,#FFFFFF",
        "description": "Mental wellness coaching. Mindset transformation. Psychology-backed programs.",
        "cta_text": "Begin Your Shift",
        "cta_link": "https://franciscoderek7.github.io/mindshift-makayla",  # mindshift-makayla.com not yet owned
    },
]

VACANT_FLOOR_NUMBER = 12
VACANT_TIER = "premium"
VACANT_MONTHLY_RATE_CENTS = 99900  # $999/mo


def _seed_occupied_floor(db, spec: dict) -> None:
    floor_number = spec["floor_number"]

    company = db.query(Company).filter(Company.floor_number == floor_number).first()
    if not company:
        company = Company(floor_number=floor_number, name=spec["name"])
        db.add(company)
        db.flush()
    company.name = spec["name"]
    company.theme = spec["theme"]
    company.description = spec["description"]
    company.cta_text = spec["cta_text"]
    company.cta_link = spec["cta_link"]
    company.is_active = True

    floor_row = db.query(FloorRow).filter(FloorRow.floor_number == floor_number).first()
    if not floor_row:
        floor_row = FloorRow(floor_number=floor_number)
        db.add(floor_row)
    floor_row.status = "active"
    floor_row.company_id = company.id

    print(f"  floor {floor_number:<2} -> {spec['name']} ({spec['cta_link']})")


def _seed_vacant_floor(db) -> None:
    floor_row = db.query(FloorRow).filter(FloorRow.floor_number == VACANT_FLOOR_NUMBER).first()
    if not floor_row:
        floor_row = FloorRow(floor_number=VACANT_FLOOR_NUMBER)
        db.add(floor_row)
    floor_row.status = "vacant"
    floor_row.tier = VACANT_TIER
    floor_row.monthly_rate_cents = VACANT_MONTHLY_RATE_CENTS
    floor_row.billing_status = None

    print(f"  floor {VACANT_FLOOR_NUMBER:<2} -> VACANT, ${VACANT_MONTHLY_RATE_CENTS / 100:.0f}/mo, tier={VACANT_TIER}")


def main() -> None:
    init_db()
    db = SessionLocal()
    try:
        for spec in OCCUPIED_FLOORS:
            _seed_occupied_floor(db, spec)
        _seed_vacant_floor(db)
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    main()
