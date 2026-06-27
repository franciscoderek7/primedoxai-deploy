"""
backend/api/generate.py

POST /api/generate kicks off document generation as a FastAPI BackgroundTask
(not a real job queue — there's no Celery/Redis worker wired into a deploy
target yet, so this only survives as long as the request's worker process
does). Good enough for an MVP; flag to Derek before relying on it for
anything that must survive a server restart mid-generation.
"""

from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..core.db import get_db
from ..db_models.document import Document
from ..db_models.user import User
from ..schemas import GenerateRequest, GenerateResponse
from ..services.pdf import render_text_to_pdf
from ..services.storage import upload_pdf
from .deps import get_current_user

router = APIRouter(prefix="/api/generate", tags=["generate"])


def _run_generation(document_id: UUID, db: Session) -> None:
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        return

    try:
        # Placeholder text generation — wire to OpenAI/Gemma here.
        body = (
            f"DOCUMENT TYPE: {doc.type}\n\n{doc.prompt}\n\n"
            "[Generated content placeholder — wire to the LLM of your choice "
            "in backend/api/generate.py:_run_generation]"
        )
        doc.content = body

        pdf_bytes = render_text_to_pdf(doc.type.replace("_", " ").title(), body)
        doc.pdf_url = upload_pdf(pdf_bytes, f"{document_id}.pdf")
        doc.status = "ready"
    except Exception as exc:  # noqa: BLE001 — generation failures must not crash the worker
        doc.status = "error"
        doc.content = f"Generation failed: {exc}"
    finally:
        from datetime import datetime, timezone

        doc.completed_at = datetime.now(timezone.utc)
        db.commit()


@router.post("", response_model=GenerateResponse)
def generate(
    body: GenerateRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = Document(user_id=current_user.id, type=body.type, prompt=body.prompt, status="generating")
    db.add(doc)
    db.commit()
    db.refresh(doc)

    background_tasks.add_task(_run_generation, doc.id, db)

    return GenerateResponse(document_id=doc.id, status="generating", estimated_time=30)


@router.get("/{document_id}", response_model=None)
def get_document_status(
    document_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Document not found")
    return {
        "document_id": doc.id,
        "status": doc.status,
        "pdf_url": doc.pdf_url,
        "content": doc.content,
    }


@router.post("/webhook")
def generate_webhook(payload: dict, db: Session = Depends(get_db)):
    """For an external generation worker to report completion back."""
    doc = db.query(Document).filter(Document.id == payload.get("document_id")).first()
    if not doc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Document not found")
    doc.status = payload.get("status", doc.status)
    doc.pdf_url = payload.get("pdf_url", doc.pdf_url)
    db.commit()
    return {"ok": True}
