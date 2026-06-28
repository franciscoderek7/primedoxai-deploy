"""
backend/services/pdf.py

Uses fpdf2 (pure Python, no system libraries) rather than WeasyPrint/Playwright —
both of those need Cairo/Pango or a headless Chromium installed on the deploy
box. fpdf2 produces a plain but reliable PDF with zero extra system deps,
which matters because the actual production host (Railway/Render) isn't
configured by this codebase. Swap this module out if Derek's deploy target
already has WeasyPrint's system deps installed.
"""

from io import BytesIO

from fpdf import FPDF


def render_text_to_pdf(title: str, body: str) -> bytes:
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 16)
    pdf.multi_cell(0, 10, title)
    pdf.ln(4)
    pdf.set_font("Helvetica", "", 12)
    pdf.multi_cell(0, 7, body)

    buf = BytesIO()
    pdf.output(buf)
    return buf.getvalue()
