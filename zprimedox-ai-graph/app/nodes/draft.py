"""
Node 5: DRAFT
Generates the primary document in Doc Weedlaw's voice and style.
"""
from app.models.state import GraphState
from app.services.llm import invoke_llm
import json


DRAFT_TEMPLATES = {
    "motion": """Draft a Notice of Motion for the Ontario Superior Court of Justice.

CASE SUMMARY: {case_summary}
CONSTITUTIONAL ANALYSIS: {constitutional_memo}
RECOMMENDED STRATEGY: {strategy}
RESEARCH: {research_memo}

Use Doc Weedlaw's authoritative constitutional voice.
Format: Ontario Rules of Civil Procedure compliant.
Include: Court file number placeholder [FILE #], parties, relief sought, grounds, schedule of evidence, certification.
Every constitutional argument must cite the specific Charter section and leading case.""",

    "affidavit": """Draft an Affidavit for the Ontario Superior Court of Justice.

CASE SUMMARY: {case_summary}
STRATEGY: {strategy}
RESEARCH: {research_memo}

Format: Ontario Rules of Civil Procedure, Form 4D.
Include: Deponent details, sworn statement, numbered paragraphs, exhibits list.
Write in first person from the deponent's perspective.
Flag placeholders [NAME], [DATE], [ADDRESS] for Doc to complete.""",

    "demand_letter": """Draft a formal Demand Letter.

CASE SUMMARY: {case_summary}
CONSTITUTIONAL BASIS: {constitutional_memo}
STRATEGY: {strategy}
RESEARCH: {research_memo}

Format: Professional legal letter, Francisco Holdings Inc. letterhead.
Include: Date, recipient, subject line, facts, legal basis, demands, deadline, consequences, signature block.
Tone: Firm, professional, constitutional authority.""",

    "statement_of_claim": """Draft a Statement of Claim for the Ontario Superior Court of Justice.

CASE SUMMARY: {case_summary}
CONSTITUTIONAL ANALYSIS: {constitutional_memo}
RESEARCH: {research_memo}

Format: Ontario Rules of Civil Procedure, Form 14A.
Include: Court header, plaintiff/defendant, claim, facts (numbered), law, relief claimed.
Constitutional claims must reference specific Charter sections.
Use BENO-X framework where applicable.""",

    "foi_request": """Draft a Freedom of Information Request.

CASE SUMMARY: {case_summary}
RESEARCH: {research_memo}

Format: Formal FOI request letter under Ontario Freedom of Information and Protection of Privacy Act (FIPPA) or federal Access to Information Act.
Include: Specific records requested, time period, waiver request, contact information.""",

    "incident_report": """Generate a formal Incident Report.

INCIDENT SUMMARY: {case_summary}
TRIAGE DATA: {constitutional_memo}
STRATEGY: {strategy}

Format: Professional incident report.
Include: Date/time, location, units, narrative, actions taken, constitutional compliance notes, follow-up required.""",

    "threat_report": """Generate a Cybersecurity Incident Report.

THREAT SUMMARY: {case_summary}
THREAT PROFILE: {constitutional_memo}
CONTAINMENT PLAN: {strategy}
RESEARCH: {research_memo}

Format: Professional security incident report for compliance and insurance.
Include: Executive summary, technical details, impact assessment, timeline, actions taken, remediation plan, regulatory notification requirements.""",

    "strategy_memo": """Generate a Strategic Business Memorandum.

QUERY: {case_summary}
ANALYSIS: {constitutional_memo}
RECOMMENDATION: {strategy}
RESEARCH: {research_memo}

Format: Executive memorandum, Francisco Holdings Inc.
Include: Executive summary, situation analysis, options considered, recommendation, implementation steps, risk assessment.""",
}


async def draft_node(state: GraphState) -> GraphState:
    domain = state.get("domain", "legal")
    doc_type = state.get("document_type", "motion")

    # Map domain-specific defaults
    if not doc_type or doc_type == "other":
        defaults = {"legal": "motion", "cyber": "threat_report", "safety": "incident_report", "business": "strategy_memo"}
        doc_type = defaults.get(domain, "motion")

    template = DRAFT_TEMPLATES.get(doc_type, DRAFT_TEMPLATES["motion"])

    prompt = template.format(
        case_summary=state.get("case_summary", state["query"]),
        constitutional_memo=state.get("constitutional_memo", state.get("threat_profile", "See research.")),
        strategy=state.get("recommended_strategy", "Default: pursue most aggressive constitutional remedy."),
        research_memo=state.get("research_memo", "See intake analysis."),
    )

    try:
        draft = await invoke_llm(
            f"{domain}_draft" if domain in ["legal"] else f"{domain}_intake",
            prompt,
            temperature=0.2,
            max_tokens=8000,
        )

        return {
            **state,
            "draft_document": draft,
            "document_type": doc_type,
            "error": None,
        }

    except Exception as e:
        return {**state, "error": f"Draft failed: {str(e)}", "retry_count": state.get("retry_count", 0) + 1}
