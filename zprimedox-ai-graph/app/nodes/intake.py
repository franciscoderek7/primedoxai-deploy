"""
Node 1: INTAKE
Parses user query, extracts entities, classifies domain and urgency.
"""
import json
from app.models.state import GraphState
from app.services.llm import invoke_llm
from app.services.memory_graph import get_entity_context


INTAKE_PROMPTS = {
    "legal": """Extract structured information from this legal query.

Query: {query}

Respond with JSON only:
{{
  "entities": {{
    "people": ["list of person names mentioned"],
    "organizations": ["organizations, companies, courts"],
    "statutes": ["CDSA, Cannabis Act, Charter sections, etc."],
    "dates": ["any dates mentioned"],
    "courts": ["court names if mentioned"],
    "amounts": ["dollar amounts if any"]
  }},
  "urgency": "emergency|high|normal|low",
  "document_type": "motion|affidavit|demand_letter|statement_of_claim|foi_request|other",
  "case_summary": "one sentence summary",
  "charter_sections": ["list of relevant Charter sections like s.7, s.8, s.15"]
}}""",

    "cyber": """Extract structured information from this cybersecurity alert.

Query: {query}

Respond with JSON only:
{{
  "entities": {{
    "ips": ["IP addresses mentioned"],
    "domains": ["domains or URLs"],
    "hashes": ["file hashes"],
    "systems": ["affected systems or software"],
    "threat_actor": "known group if identifiable"
  }},
  "urgency": "emergency|high|normal|low",
  "threat_type": "malware|phishing|ddos|insider|ransomware|data_breach|other",
  "case_summary": "one sentence summary",
  "mitre_ttps": ["MITRE ATT&CK technique IDs if identifiable"]
}}""",

    "safety": """Extract structured information from this public safety incident.

Query: {query}

Respond with JSON only:
{{
  "entities": {{
    "location": "address or area",
    "incident_type": "fire|medical|crime|traffic|hazmat|other",
    "people_involved": ["number or descriptions"],
    "units_dispatched": []
  }},
  "urgency": "emergency|high|normal|low",
  "case_summary": "one sentence summary",
  "constitutional_flags": ["any immediate rights concerns to flag"]
}}""",

    "business": """Extract structured information from this business query.

Query: {query}

Respond with JSON only:
{{
  "entities": {{
    "companies": ["companies mentioned"],
    "people": ["people mentioned"],
    "amounts": ["financial amounts"],
    "timeframes": ["deadlines or timeframes"]
  }},
  "urgency": "emergency|high|normal|low",
  "query_type": "strategy|contract|investment|litigation|partnership|other",
  "case_summary": "one sentence summary"
}}""",
}


async def intake_node(state: GraphState) -> GraphState:
    domain = state.get("domain", "legal")
    query = state["query"]

    prompt_template = INTAKE_PROMPTS.get(domain, INTAKE_PROMPTS["legal"])
    prompt = prompt_template.format(query=query)

    try:
        raw = await invoke_llm(f"{domain}_intake", prompt, temperature=0.0)

        # Extract JSON from response
        start = raw.find("{")
        end = raw.rfind("}") + 1
        parsed = json.loads(raw[start:end]) if start >= 0 else {}

        entities = parsed.get("entities", {})
        case_summary = parsed.get("case_summary", "")

        # Enrich with knowledge graph context for known entities
        kg_context = []
        for person in entities.get("people", []):
            ctx = await get_entity_context(person)
            if ctx:
                kg_context.append(ctx)

        if kg_context:
            case_summary += f"\n\nKnown context: {json.dumps(kg_context, indent=2)}"

        return {
            **state,
            "entities": entities,
            "urgency": parsed.get("urgency", state.get("urgency", "normal")),
            "document_type": parsed.get("document_type") or parsed.get("query_type") or parsed.get("threat_type"),
            "case_summary": case_summary,
            "error": None,
        }

    except Exception as e:
        return {**state, "error": f"Intake failed: {str(e)}", "retry_count": state.get("retry_count", 0) + 1}
