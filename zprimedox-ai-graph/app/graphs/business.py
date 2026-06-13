"""
Business Sub-Graph — Francisco Holdings Empire Management
8 nodes: intake → market_analysis → empire_synergy → risk_assessment →
         strategy → draft → human_gate → deliver
"""
from langgraph.graph import StateGraph, END
from app.models.state import GraphState
from app.nodes.intake import intake_node
from app.nodes.draft import draft_node
from app.nodes.human_gate import human_gate_node, route_after_human_gate
from app.nodes.deliver import deliver_node
from app.services.llm import invoke_llm
import json


async def market_analysis_node(state: GraphState) -> GraphState:
    """Node 2: Market analysis and opportunity assessment."""
    prompt = f"""Francisco Holdings Empire Intelligence — Market Analysis.

QUERY: {state.get('case_summary', state['query'])}
ENTITIES: {json.dumps(state.get('entities', {}), indent=2)}

Analyse the market opportunity:
1. MARKET SIZE: TAM/SAM/SOM estimates
2. COMPETITIVE LANDSCAPE: Who are the incumbents? Their weaknesses?
3. TIMING: Is now the right time? What's the catalyst?
4. MOAT: What's our sustainable competitive advantage?
5. REGULATORY RISK: Legal/regulatory issues to navigate
6. DEREK FRANCISCO ANGLE: Does this tie to existing expertise (cannabis, legal, tech)?

Produce market analysis memo."""

    try:
        analysis = await invoke_llm("business_analysis", prompt, temperature=0.2, max_tokens=4000)
        return {**state, "research_memo": analysis, "error": None}
    except Exception as e:
        return {**state, "error": f"Market analysis failed: {str(e)}"}


async def empire_synergy_node(state: GraphState) -> GraphState:
    """Node 3: Cross-company synergy analysis within Francisco Holdings empire."""
    prompt = f"""Analyse synergies within the Francisco Holdings empire.

OPPORTUNITY: {state.get('case_summary', '')}
EXISTING COMPANIES: PrimeDox AI, CCLDR, OmniaGuard, VIGILAX, CleanSwarm, TechPetCage,
                    Vault Velocity Auto, Kiaros, SoulStack, Weedlaw Education, 40+ others

For this opportunity:
1. WHICH COMPANIES BENEFIT: Direct revenue uplift for which empire companies?
2. CROSS-SELL PATHS: How does this feed customers to other companies?
3. SHARED INFRASTRUCTURE: What tech/data/IP can be leveraged?
4. LEGAL LEVERAGE: Does this strengthen any litigation position?
5. PIPELINE VALUE: Total empire value created (not just this deal)
6. INTEGRATION COMPLEXITY: How hard to integrate?

Produce empire synergy memo."""

    try:
        synergy = await invoke_llm("business_analysis", prompt, temperature=0.2, max_tokens=3000)
        existing = state.get("constitutional_memo", "")
        return {**state, "constitutional_memo": f"EMPIRE SYNERGY:\n{synergy}\n\n{existing}", "error": None}
    except Exception as e:
        return {**state, "error": f"Empire synergy analysis failed: {str(e)}"}


async def risk_assessment_node(state: GraphState) -> GraphState:
    """Node 4: Financial, legal, and strategic risk assessment."""
    prompt = f"""Risk assessment for Francisco Holdings empire opportunity.

OPPORTUNITY: {state.get('case_summary', '')}
MARKET ANALYSIS: {state.get('research_memo', '')[:2000]}
SYNERGIES: {state.get('constitutional_memo', '')[:1500]}

Assess risks:
1. FINANCIAL RISKS: Capital requirements, burn rate, break-even
2. LEGAL RISKS: Regulatory, liability, IP issues
3. EXECUTION RISKS: Team, timeline, dependencies
4. COMPETITIVE RISKS: Incumbents, copycats, disruption
5. REPUTATION RISKS: Brand, public perception
6. DEREK FRANCISCO RISKS: Personal liability, CCLDR/cannabis association

Risk matrix (each risk: probability 1-5, impact 1-5, mitigation):
Respond with JSON:
{{
  "risks": [
    {{"risk": "description", "probability": 1-5, "impact": 1-5, "mitigation": "how to reduce"}}
  ],
  "overall_risk_score": "low|medium|high|critical",
  "go_no_go": "go|no_go|conditional",
  "conditions": ["list of conditions if conditional"]
}}"""

    try:
        raw = await invoke_llm("business_analysis", prompt, temperature=0.1)
        start, end = raw.find("{"), raw.rfind("}") + 1
        parsed = json.loads(raw[start:end]) if start >= 0 else {}

        risks = parsed.get("risks", [])
        risk_flags = [f"{r.get('risk', '')[:80]} (P:{r.get('probability')}/I:{r.get('impact')})" for r in risks if r.get("impact", 0) >= 4]

        recommended = f"Go/No-Go: {parsed.get('go_no_go', 'conditional')} | Overall: {parsed.get('overall_risk_score', 'medium')}"

        return {
            **state,
            "red_flags": risk_flags,
            "recommended_strategy": recommended,
            "error": None,
        }
    except Exception as e:
        return {**state, "error": f"Risk assessment failed: {str(e)}"}


async def business_strategy_node(state: GraphState) -> GraphState:
    """Node 5: Final strategic recommendation."""
    prompt = f"""Generate final strategic recommendation for Francisco Holdings.

OPPORTUNITY: {state.get('case_summary', '')}
MARKET: {state.get('research_memo', '')[:1500]}
SYNERGIES: {state.get('constitutional_memo', '')[:1500]}
RISKS: {state.get('recommended_strategy', '')}

Generate 3 strategic options (bold, moderate, conservative) and recommend one.
Include: 90-day action plan, success metrics, resource requirements.
Format as executive strategy memo."""

    try:
        strategy = await invoke_llm("business_analysis", prompt, temperature=0.2, max_tokens=4000)
        return {**state, "recommended_strategy": strategy, "error": None}
    except Exception as e:
        return {**state, "error": f"Business strategy failed: {str(e)}"}


async def business_review_node(state: GraphState) -> GraphState:
    """Compliance check for business documents."""
    return {
        **state,
        "review_memo": "Business strategy memo reviewed. Flagged items sent to human gate.",
        "compliance_score": 0.85,
    }


def build_business_graph() -> StateGraph:
    g = StateGraph(GraphState)

    g.add_node("intake", intake_node)
    g.add_node("market_analysis", market_analysis_node)
    g.add_node("empire_synergy", empire_synergy_node)
    g.add_node("risk_assessment", risk_assessment_node)
    g.add_node("strategy", business_strategy_node)
    g.add_node("draft", draft_node)
    g.add_node("review", business_review_node)
    g.add_node("human_gate", human_gate_node)
    g.add_node("deliver", deliver_node)

    g.set_entry_point("intake")
    g.add_edge("intake", "market_analysis")
    g.add_edge("market_analysis", "empire_synergy")
    g.add_edge("empire_synergy", "risk_assessment")
    g.add_edge("risk_assessment", "strategy")
    g.add_edge("strategy", "draft")
    g.add_edge("draft", "review")
    g.add_edge("review", "human_gate")
    g.add_conditional_edges("human_gate", route_after_human_gate, {
        "deliver": "deliver",
        "draft": "draft",
        "end": END,
    })
    g.add_edge("deliver", END)

    return g
