"""
Cyber Sub-Graph — VIGILAX
8 nodes: alert_intake → enrichment → impact_analysis → containment_strategy →
         human_gate → execution → remediation → documentation
"""
from langgraph.graph import StateGraph, END
from app.models.state import GraphState
from app.nodes.intake import intake_node
from app.nodes.research import research_node
from app.nodes.draft import draft_node
from app.nodes.review import review_node, should_proceed_to_human_gate
from app.nodes.human_gate import human_gate_node, route_after_human_gate
from app.nodes.deliver import deliver_node
from app.services.llm import invoke_llm
import json


async def enrichment_node(state: GraphState) -> GraphState:
    """Node 2: Enrich threat data with IOC analysis and actor attribution."""
    prompt = f"""Enrich this cybersecurity threat with intelligence analysis.

ALERT: {state.get('case_summary', state['query'])}
IOCs: {json.dumps(state.get('entities', {}), indent=2)}

Produce a Threat Enrichment Report:

1. IOC ANALYSIS
   For each IOC: reputation, first seen, associated campaigns, confidence score.

2. MITRE ATT&CK MAPPING
   Map to Tactics (TA), Techniques (T), and Sub-techniques.

3. THREAT ACTOR ATTRIBUTION
   Known groups using these TTPs? Confidence level?

4. KILL CHAIN STAGE
   Where in the attack lifecycle is this? Initial access, execution, persistence, etc.

5. REGULATORY IMPLICATIONS
   - PIPEDA breach notification required? (500+ individuals affected threshold)
   - Industry-specific: HIPAA, PCI-DSS, SOX
   - Law enforcement notification required?

6. THREAT SEVERITY SCORE
   Overall: 1-10 with justification."""

    try:
        enrichment = await invoke_llm("cyber_enrichment", prompt, temperature=0.0, max_tokens=4000)
        return {**state, "constitutional_memo": enrichment, "error": None}
    except Exception as e:
        return {**state, "error": f"Enrichment failed: {str(e)}"}


async def impact_analysis_node(state: GraphState) -> GraphState:
    """Node 3: Business impact and affected systems analysis."""
    prompt = f"""Perform impact analysis for this cybersecurity incident.

THREAT SUMMARY: {state.get('case_summary', '')}
ENRICHMENT: {state.get('constitutional_memo', '')[:3000]}

Assess:
1. AFFECTED SYSTEMS: Which systems, services, data are at risk?
2. DATA IMPACT: PII, financial, proprietary data exposed?
3. BUSINESS IMPACT: Revenue, operations, reputation
4. REGULATORY EXPOSURE: Fines, notification obligations
5. RECOVERY TIME OBJECTIVE: How long to restore normal operations?

Produce impact assessment with severity classification."""

    try:
        impact = await invoke_llm("cyber_intake", prompt, temperature=0.0, max_tokens=3000)
        existing = state.get("research_memo", "")
        return {**state, "research_memo": f"{existing}\n\nIMPACT ANALYSIS:\n{impact}", "error": None}
    except Exception as e:
        return {**state, "error": f"Impact analysis failed: {str(e)}"}


async def containment_strategy_node(state: GraphState) -> GraphState:
    """Node 4: Generate containment playbook."""
    prompt = f"""Generate a containment and response strategy.

THREAT: {state.get('case_summary', '')}
ENRICHMENT: {state.get('constitutional_memo', '')[:2000]}
IMPACT: {state.get('research_memo', '')[:2000]}

Generate a Containment Playbook. Respond with JSON:
{{
  "immediate_actions": ["list — do in next 15 minutes"],
  "short_term_actions": ["list — do in next 4 hours"],
  "containment_steps": ["numbered list of isolation/containment steps"],
  "disruptive_actions_requiring_approval": ["actions that need supervisor sign-off"],
  "communication_plan": "who to notify and when",
  "evidence_preservation": ["steps to preserve forensic evidence"],
  "estimated_resolution_time": "timeframe"
}}"""

    try:
        raw = await invoke_llm("cyber_enrichment", prompt, temperature=0.1)
        start, end = raw.find("{"), raw.rfind("}") + 1
        parsed = json.loads(raw[start:end]) if start >= 0 else {}

        playbook = json.dumps(parsed, indent=2)
        disruptive = parsed.get("disruptive_actions_requiring_approval", [])

        return {
            **state,
            "strategy_options": [{"name": "Containment Playbook", "description": playbook}],
            "recommended_strategy": playbook,
            "red_flags": disruptive,
            "error": None,
        }
    except Exception as e:
        return {**state, "error": f"Containment strategy failed: {str(e)}"}


async def remediation_node(state: GraphState) -> GraphState:
    """Node 7: Root cause analysis and remediation plan."""
    prompt = f"""Generate a remediation plan for this incident.

INCIDENT: {state.get('case_summary', '')}
FINAL DOCUMENT (approved actions): {state.get('final_document', '')[:3000]}

Produce:
1. ROOT CAUSE ANALYSIS: What enabled this attack?
2. IMMEDIATE FIXES: Patch, reconfigure, harden
3. LONG-TERM IMPROVEMENTS: Architecture, process, training
4. METRICS: How to measure success of remediation"""

    try:
        remediation = await invoke_llm("cyber_enrichment", prompt, temperature=0.1, max_tokens=3000)
        existing_doc = state.get("final_document", "")
        return {**state, "final_document": f"{existing_doc}\n\n## REMEDIATION PLAN\n{remediation}", "error": None}
    except Exception as e:
        return {**state, "error": f"Remediation failed: {str(e)}"}


def build_cyber_graph() -> StateGraph:
    g = StateGraph(GraphState)

    g.add_node("intake", intake_node)
    g.add_node("enrichment", enrichment_node)
    g.add_node("impact_analysis", impact_analysis_node)
    g.add_node("containment_strategy", containment_strategy_node)
    g.add_node("draft", draft_node)          # generates threat report
    g.add_node("review", review_node)
    g.add_node("human_gate", human_gate_node)
    g.add_node("remediation", remediation_node)
    g.add_node("deliver", deliver_node)

    g.set_entry_point("intake")
    g.add_edge("intake", "enrichment")
    g.add_edge("enrichment", "impact_analysis")
    g.add_edge("impact_analysis", "containment_strategy")
    g.add_edge("containment_strategy", "draft")
    g.add_edge("draft", "review")
    g.add_conditional_edges("review", should_proceed_to_human_gate, {"human_gate": "human_gate", "error": "draft"})
    g.add_conditional_edges("human_gate", route_after_human_gate, {
        "deliver": "remediation",
        "draft": "draft",
        "end": END,
    })
    g.add_edge("remediation", "deliver")
    g.add_edge("deliver", END)

    return g
