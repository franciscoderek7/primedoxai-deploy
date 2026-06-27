from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..core.db import get_db
from ..db_models.company import Company

router = APIRouter(prefix="/api/company", tags=["company"])


@router.get("/{company_id}")
def get_company(company_id: UUID, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Company not found")
    return {
        "id": company.id,
        "floor_number": company.floor_number,
        "name": company.name,
        "industry": company.industry,
        "colors": company.colors,
        "ai_role": company.ai_role,
        "services": company.services,
        "team": company.team,
        "is_active": company.is_active,
        "theme": company.theme,
        "description": company.description,
        "cta_text": company.cta_text,
        "cta_link": company.cta_link,
    }
