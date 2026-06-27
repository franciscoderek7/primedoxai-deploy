"""
backend/services/storage.py

Uploads generated PDFs to Supabase Storage when SUPABASE_URL/SUPABASE_KEY
are set; otherwise falls back to writing into a local ./generated_docs/
folder and returning a relative path. The fallback exists so /api/generate
works end-to-end on a laptop with zero cloud credentials configured —
swap to the real bucket the moment Supabase env vars are supplied.
"""

import os
import uuid

from ..core.config import settings

LOCAL_DIR = "generated_docs"


def upload_pdf(content: bytes, filename: str | None = None) -> str:
    filename = filename or f"{uuid.uuid4()}.pdf"

    if settings.SUPABASE_URL and settings.SUPABASE_KEY:
        from supabase import create_client

        client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        bucket = "documents"
        client.storage.from_(bucket).upload(filename, content, {"content-type": "application/pdf"})
        return f"{settings.SUPABASE_URL}/storage/v1/object/public/{bucket}/{filename}"

    os.makedirs(LOCAL_DIR, exist_ok=True)
    path = os.path.join(LOCAL_DIR, filename)
    with open(path, "wb") as f:
        f.write(content)
    return path
