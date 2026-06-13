"""
Safety Sub-Graph — OmniaGuard
8 nodes: dispatch → triage → protocol_match → resource_deployment →
         constitutional_check → human_gate → documentation → follow_up
"""
from langgraph.graph import StateGraph, END
from app.models.state import GraphState
from app.nodes.intake import intake_node
from app.nodes.human_gate import human_gate_node, route_after_human_gate
from app.nodes.deliver import deliver_node
from app.services.llm import invoke_llm
import json


async def triage_node(state: GraphState) -> GraphState:
    """Node 2: Casualty assessment and threat level classification."""
    prompt = f"""Perform incident triage for this public safety event.

INCIDENT: {state.get('case_summary', state['query'])}
TYPE: {state.get('document_type', 'unknown')}

Triage Report:
1. CASUALTY ASSESSMENT: Injuries, fatalities, at-risk persons
2. THREAT LEVEL: 1-5 scale with description
3. ACTIVE DANGER: Is there ongoing threat to responders?
4. RESOURCE REQUIREMENTS: Units, equipment, medical, specialists
5. PRIORITY ACTIONS: First 3 immediate actions

Respond with JSON:
{{
  "threat_level": 1-5,
  "casualties": "description",
  "active_danger": true|false,
  "danger_description": "if active",
  "required_resources": ["list"],
  "priority_actions": ["1.", "2.", "3."],
  "triage_summary": "one paragraph"
}}"""

    try:
        raw = await invoke_llm("safety_dispatch", prompt, temperature=0.0)
        start, end = raw.find("{"), raw.rfind("}") + 1
        parsed = json.loads(raw[start:end]) if start >= 0 else {}
        triage_summary = parsed.get("triage_summary", raw)
        threat_level = parsed.get("threat_level", 3)

        return {
            **state,
            "incident_report": parsed,
            "constitutional_memo": triage_summary,
            "urgency": "emergency" if threat_level >= 4 else "high" if threat_level >= 3 else "normal",
            "error": None,
        }
    except Exception as e:
        return {**state, "error": f"Triage failed: {str(e)}"}


async def protocol_match_node(state: GraphState) -> GraphState:
    """Node 3: Match to standard operating procedures."""
    incident_type = state.get("document_type", "other")
    prompt = f"""Match this incident to standard operating procedures.

INCIDENT TYPE: {incident_type}
TRIAGE: {state.get('constitutional_memo', '')[:2000]}

1. PRIMARY SOP: Name and key steps
2. SECONDARY SOPs: Any supplementary procedures
3. SPECIAL CIRCUMSTANCES: Hazmat, hostage, active shooter protocols
4. INTER-AGENCY: Which agencies to notify/coordinate with
5. ICS STRUCTURE: Who's Incident Commander, Operations, Logistics"""

    try:
        protocol = await invoke_llm("safety_dispatch", prompt, temperature=0.0, max_tokens=3000)
        existing = state.get("research_memo", "")
        return {**state, "research_memo": f"PROTOCOL MATCH:\n{protocol}\n\n{existing}", "error": None}
    except Exception as e:
        return {**state, "error": f"Protocol match failed: {str(e)}"}


async def resource_deployment_node(state: GraphState) -> GraphState:
    """Node 4: Deployment planning."""
    prompt = f"""Generate resource deployment plan.

INCIDENT: {state.get('case_summary', '')}
TRIAGE: {state.get('constitutional_memo', '')[:1500]}
PROTOCOL: {state.get('research_memo', '')[:1500]}

Deployment Plan:
1. UNIT ASSIGNMENTS: Which units to what positions
2. HOSPITAL ROUTING: Nearest facility with capacity
3. SPECIALIST TEAMS: SWAT, HAZMAT, K9, ERT if needed
4. MUTUAL AID: Neighboring jurisdictions if needed
5. TIMELINE: T+0 through T+60 minutes

Respond with structured deployment plan."""

    try:
        deployment = await invoke_llm("safety_dispatch", prompt, temperature=0.0, max_tokens=3000)
        options = [{"name": "Deployment Plan", "description": deployment}]
        return {**state, "strategy_options": options, "recommended_strategy": deployment, "error": None}
    except Exception as e:
        return {**state, "error": f"Resource deployment failed: {str(e)}"}


async def constitutional_check_node(state: GraphState) -> GraphState:
    """
    Node 5: UNIQUE to OmniaGuard — Constitutional compliance check BEFORE action.
    No other public safety AI has this.
    """
    prompt = f"""CRITICAL: Constitutional compliance check before deployment.

INCIDENT: {state.get('case_summary', '')}
PLANNED ACTIONS: {state.get('recommended_strategy', '')[:3000]}

Review EVERY planned action against the Charter and Criminal Code:

1. SEARCH AND ENTRY (Charter s.8)
   - Is there warrant authority?
   - Does exigent circumstances exception apply? Cite specific Criminal Code provision.
   - Plain view doctrine applicable?

2. DETENTION (Charter s.9)
   - Any anticipated detentions justified?
   - Articulable cause standard met?

3. ARREST (Charter s.10)
   - Right to counsel notifications planned?
   - Habeas corpus rights communicated?

4. USE OF FORCE (Criminal Code s.25, s.34)
   - Force options proportionate to threat?
   - Continuum of force documented?

5. PRIVACY (Charter s.8)
   - Any surveillance planned? Warrant required?

6. FLAGS FOR SUPERVISOR
   List any actions that REQUIRE supervisor approval due to constitutional risk.

This check protects officers from liability and protects citizens' rights.
Produce: Constitutional Compliance Memo with specific approval requirements."""

    try:
        charter_memo = await invoke_llm("safety_constitutional", prompt, temperature=0.0, max_tokens=4000)

        # Extract red flags (lines containing "REQUIRE" or "MUST" or "Charter")
        red_flags = [
            line.strip("- •").strip()
            for line in charter_memo.split("\n")
            if any(kw in line.upper() for kw in ["REQUIRE", "MUST", "WARRANT", "VIOLATION", "FLAG"])
            and len(line.strip()) > 10
        ][:10]

        return {
            **state,
            "constitutional_memo": charter_memo,
            "red_flags": red_flags,
            "error": None,
        }
    except Exception as e:
        return {**state, "error": f"Constitutional check failed: {str(e)}"}


async def documentation_node(state: GraphState) -> GraphState:
    """Node 7: Auto-generate incident documentation package."""
    prompt = f"""Generate complete incident documentation package.

INCIDENT: {state.get('case_summary', '')}
ACTIONS TAKEN: {state.get('final_document', '')[:3000]}
CONSTITUTIONAL COMPLIANCE: {state.get('constitutional_memo', '')[:2000]}

Generate:
1. OFFICIAL INCIDENT REPORT (narrative format)
2. CHAIN OF CUSTODY LOG (if evidence collected)
3. USE OF FORCE REPORT (if applicable)
4. WITNESS STATEMENT TEMPLATE
5. MEDIA RELEASE TEMPLATE (if required)

Timestamp all entries. Include officer certification statement."""

    try:
        docs = await invoke_llm("safety_dispatch", prompt, temperature=0.1, max_tokens=5000)
        existing = state.get("final_document", "")
        return {**state, "final_document": f"{existing}\n\n## DOCUMENTATION PACKAGE\n{docs}", "error": None}
    except Exception as e:
        return {**state, "error": f"Documentation failed: {str(e)}"}


async def follow_up_node(state: GraphState) -> GraphState:
    """Node 8: Schedule debrief, training needs, protocol updates."""
    prompt = f"""Generate follow-up action plan for this incident.

INCIDENT: {state.get('case_summary', '')}
SELF REVIEW: {state.get('self_review', 'Not yet generated.')}

1. DEBRIEF SCHEDULE: When and who should attend
2. TRAINING NEEDS: Any gaps identified that require training
3. PROTOCOL UPDATES: Should any SOPs be updated based on this incident?
4. METRICS: Measure response time, compliance, outcomes"""

    try:
        followup = await invoke_llm("safety_dispatch", prompt, temperature=0.1, max_tokens=2000)
        existing = state.get("final_document", "")
        return {**state, "final_document": f"{existing}\n\n## FOLLOW-UP PLAN\n{followup}", "error": None}
    except Exception as e:
        return {**state, "error": f"Follow-up failed: {str(e)}"}


async def safety_review_node(state: GraphState) -> GraphState:
    """Abbreviated review for safety incidents — checks constitutional compliance."""
    red_flags = state.get("red_flags", [])
    compliance_score = 0.9 if not red_flags else max(0.5, 0.9 - (len(red_flags) * 0.1))
    review_memo = f"Safety incident review complete. Constitutional flags: {len(red_flags)}. Requires supervisor approval."
    return {**state, "review_memo": review_memo, "compliance_score": compliance_score}


def build_safety_graph() -> StateGraph:
    g = StateGraph(GraphState)

    g.add_node("intake", intake_node)
    g.add_node("triage", triage_node)
    g.add_node("protocol_match", protocol_match_node)
    g.add_node("resource_deployment", resource_deployment_node)
    g.add_node("constitutional_check", constitutional_check_node)
    g.add_node("review", safety_review_node)
    g.add_node("human_gate", human_gate_node)
    g.add_node("documentation", documentation_node)
    g.add_node("deliver", deliver_node)
    g.add_node("follow_up", follow_up_node)

    g.set_entry_point("intake")
    g.add_edge("intake", "triage")
    g.add_edge("triage", "protocol_match")
    g.add_edge("protocol_match", "resource_deployment")
    g.add_edge("resource_deployment", "constitutional_check")
    g.add_edge("constitutional_check", "review")
    g.add_edge("review", "human_gate")
    g.add_conditional_edges("human_gate", route_after_human_gate, {
        "deliver": "documentation",
        "draft": "resource_deployment",
        "end": END,
    })
    g.add_edge("documentation", "deliver")
    g.add_edge("deliver", "follow_up")
    g.add_edge("follow_up", END)

    return g
