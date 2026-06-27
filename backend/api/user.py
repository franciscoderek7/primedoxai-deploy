from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..core.db import get_db
from ..db_models.company import Company
from ..db_models.user import User
from .deps import get_current_user

router = APIRouter(prefix="/api/user", tags=["user"])

ACCESS_LEVEL_RANK = {"public": 0, "registered": 1, "premium": 2, "admin": 3}


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rank = ACCESS_LEVEL_RANK.get(current_user.access_level, 0)
    accessible_floors = [
        c.floor_number
        for c in db.query(Company).filter(Company.is_active.is_(True)).all()
        if rank >= 0  # all active floors are visible; gate premium-only content client-side per floor
    ]
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "access_level": current_user.access_level,
        "accessible_floors": accessible_floors,
    }
