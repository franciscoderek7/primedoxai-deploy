"""
Node 2: RESEARCH
Retrieves relevant precedents, past cases, and domain knowledge.
"""
from app.models.state import GraphState
from app.services.llm import invoke_llm
from app.services.memory_graph import search_knowledge
import json


RESEARCH_PROMPTS = {
    "legal": """You are PrimeDox AI Research Engine.

Case Summary: {case_summary}
Entities: {entities}
Query: {query}

Retrieved context from knowledge graph:
{kg_context}

Produce a comprehensive research memo:
1. RELEVANT CASE LAW: List 3-5 most relevant cases with citations
2. STATUTORY FRAMEWORK: Applicable statutes and regulations
3. CHARTER ANALYSIS PREVIEW: Key sections likely in play
4. DOC WEEDLAW PRECEDENTS: Any similar cases from the knowledge base
5. OPPOSING ARGUMENTS: What Crown/opposing counsel will argue
6. KEY STRENGTHS: Best arguments in our favour

Format as a professional legal research memo.""",

    "cyber": """You are VIGILAX Threat Intelligence Engine.

Alert Summary: {case_summary}
Entities: {entities}
Query: {query}

Retrieved threat intel:
{kg_context}

Produce a threat intelligence report:
1. THREAT CLASSIFICATION: MITRE ATT&CK mapping
2. KNOWN ACTOR PROFILE: If attributable
3. SIMILAR INCIDENTS: From knowledge base
4. IOC ANALYSIS: IP reputation, domain age, hash analysis
5. ATTACK CHAIN: Likely kill chain stages
6. REGULATORY IMPLICATIONS: PIPEDA notification requirements

Format as a threat intelligence brief.""",

    "safety": """You are OmniaGuard Research Engine.

Incident: {case_summary}
Entities: {entities}
Query: {query}

Retrieved protocols:
{kg_context}

Produce an incident analysis:
1. INCIDENT CLASSIFICATION: Type, severity, precedents
2. APPLICABLE SOPs: Standard operating procedures
3. RESOURCE REQUIREMENTS: Personnel, equipment, specialists
4. CONSTITUTIONAL CONSIDERATIONS: Pre-action rights review
5. SIMILAR INCIDENTS: From knowledge base
6. RISK ASSESSMENT: Officer safety, public safety, liability

Format as an operational intelligence brief.""",

    "business": """You are Francisco Holdings Strategic Intelligence Engine.

Query: {query}
Entities: {entities}
Context: {kg_context}

Produce a strategic analysis:
1. OPPORTUNITY ASSESSMENT: Revenue potential, risk profile
2. EMPIRE SYNERGIES: How this connects to existing companies
3. LEGAL CONSIDERATIONS: Any litigation or compliance angle
4. COMPARABLE PRECEDENTS: Similar deals or strategies
5. STAKEHOLDER ANALYSIS: Who benefits, who resists
6. FINANCIAL MODELLING: Rough numbers and scenarios""",
}


async def research_node(state: GraphState) -> GraphState:
    domain = state.get("domain", "legal")
    query = state["query"]
    case_summary = state.get("case_summary", query)
    entities = state.get("entities", {})

    # Semantic search in knowledge graph
    kg_results = await search_knowledge(query=case_summary, domain=domain, limit=5)
    kg_context = json.dumps(kg_results, indent=2) if kg_results else "No prior cases found — this is new territory."

    prompt_template = RESEARCH_PROMPTS.get(domain, RESEARCH_PROMPTS["legal"])
    prompt = prompt_template.format(
        query=query,
        case_summary=case_summary,
        entities=json.dumps(entities, indent=2),
        kg_context=kg_context,
    )

    try:
        research_memo = await invoke_llm(
            f"{domain}_research",
            prompt,
            temperature=0.1,
            max_tokens=6000,
        )

        # Extract citations (simple heuristic — lines starting with R. v. or [year])
        citations = [
            line.strip()
            for line in research_memo.split("\n")
            if line.strip().startswith(("R. v.", "[20", "[19", "SCC", "ONCA", "ONSC"))
        ]

        return {
            **state,
            "research_memo": research_memo,
            "citations": citations,
            "error": None,
        }

    except Exception as e:
        return {**state, "error": f"Research failed: {str(e)}", "retry_count": state.get("retry_count", 0) + 1}
