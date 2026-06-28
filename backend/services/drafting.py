"""
backend/services/drafting.py

Document drafting logic for /api/generate. Calls the Anthropic API when
ANTHROPIC_API_KEY is set; otherwise falls back to draft_with_template(),
a deterministic rule-based draft built from the document type and prompt
so the generate -> PDF flow works end-to-end with zero external dependency.
"""

import httpx

from ..core.config import settings

DOC_TYPE_LABELS = {
    "demand": "Demand Letter",
    "motion": "Notice of Motion",
    "cease": "Cease & Desist Letter",
    "affidavit": "Affidavit",
    "employment": "Employment Termination / Dispute Letter",
    "smallclaims": "Small Claims Statement of Claim",
    "foi": "FOI / Access to Information Request",
    "charter": "Notice of Constitutional Question",
    "contract": "Contract Dispute Letter",
}


def draft_with_template(doc_type: str, prompt: str) -> str:
    label = DOC_TYPE_LABELS.get(doc_type, doc_type.replace("_", " ").title() or "Document")
    return (
        f"{label.upper()}\n\n"
        "Date: [Today's Date]\n\n"
        "From: [Your Name]\n"
        "To: [Other Party]\n\n"
        f"RE: {label}\n\n"
        f"{prompt}\n\n"
        "Please treat this matter with the attention it requires. "
        "[Add specific demand, deadline, or relief sought here.]\n\n"
        "Sincerely,\n[Your Name]\n\n"
        "---\n"
        "[TEMPLATE DRAFT — generated from structured rules, no AI key configured. "
        "Review and fill in every bracketed placeholder before sending.]"
    )


def draft_with_anthropic(doc_type: str, prompt: str) -> str:
    label = DOC_TYPE_LABELS.get(doc_type, doc_type.replace("_", " ").title() or "Document")
    message = (
        f"Draft a {label} for the following situation:\n\n{prompt}\n\n"
        "Use [BRACKETED PLACEHOLDERS] for any specific detail (dates, amounts, "
        "addresses) not given above. Format as a complete, ready-to-edit document "
        "with proper structure for this document type."
    )
    response = httpx.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": settings.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        json={
            "model": "claude-sonnet-4-6",
            "max_tokens": 2048,
            "messages": [{"role": "user", "content": message}],
        },
        timeout=60,
    )
    response.raise_for_status()
    return response.json()["content"][0]["text"]


def draft_document(doc_type: str, prompt: str) -> str:
    if settings.ANTHROPIC_API_KEY:
        return draft_with_anthropic(doc_type, prompt)
    return draft_with_template(doc_type, prompt)
