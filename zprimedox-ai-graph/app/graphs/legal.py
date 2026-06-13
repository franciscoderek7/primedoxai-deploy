"""
Legal Sub-Graph — PrimeDox AI
8 nodes: intake → research → constitutional → strategy → draft → review → human_gate → deliver
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


# ─── Legal-specific intermediate nodes ───────────────────────────────────────

async def constitutional_analysis_node(state: GraphState) -> GraphState:
    """Node 3: Apply Charter framework and BENO-X analysis."""
    prompt = f"""Apply the BENO-X constitutional framework to this case.

CASE SUMMARY: {state.get('case_summary', state['query'])}
RESEARCH MEMO: {state.get('research_memo', '')[:4000]}
ENTITIES: {json.dumps(state.get('entities', {}), indent=2)}

Produce a Constitutional Analysis Memo:

1. BENO-X ANALYSIS
   - Banning: How cannabis prohibition is applied here
   - Enforcement: What enforcement actions are at issue
   - Normalization: Health/safety regulatory vs. criminal framing
   - Objectives: Government's stated vs. actual objectives

2. CHARTER VIOLATIONS IDENTIFIED
   For each section: describe the violation, identify the test, apply the test.
   - s.7 (life, liberty, security / fundamental justice)
   - s.8 (search and seizure — reasonable expectation)
   - s.9 (arbitrary detention)
   - s.10 (rights on arrest — counsel, habeas corpus)
   - s.15 (equality — discriminatory application)

3. SECTION 1 ANALYSIS (Oakes Test)
   Is the violation saved under s.1? Apply Oakes: pressing objective, proportionality.

4. REMEDIES AVAILABLE (s.24)
   - Exclusion of evidence (s.24(2))
   - Stay of proceedings
   - Declaration of invalidity
   - Damages

5. STRONGEST ARGUMENT
   Identify the single most powerful constitutional argument available."""

    try:
        constitutional_memo = await invoke_llm(
            "legal_constitutional", prompt, temperature=0.1, max_tokens=6000
        )
        return {**state, "constitutional_memo": constitutional_memo, "error": None}
    except Exception as e:
        return {**state, "error": f"Constitutional analysis failed: {str(e)}"}


async def strategy_node(state: GraphState) -> GraphState:
    """Node 4: Generate 3 strategic approaches and recommend one."""
    prompt = f"""Generate a litigation/legal strategy for this matter.

CASE SUMMARY: {state.get('case_summary', state['query'])}
CONSTITUTIONAL ANALYSIS: {state.get('constitutional_memo', '')[:4000]}
RESEARCH MEMO: {state.get('research_memo', '')[:3000]}

Generate THREE strategic options and a recommendation. Respond with JSON:
{{
  "options": [
    {{
      "name": "Aggressive Constitutional Challenge",
      "description": "Full Charter attack, s.52 declaration",
      "pros": ["list"],
      "cons": ["list"],
      "success_probability": 0.0-1.0,
      "timeline": "timeframe",
      "cost": "low|medium|high"
    }},
    {{
      "name": "Moderate — Exclusion Focus",
      "description": "Target evidence exclusion under s.24(2)",
      "pros": ["list"],
      "cons": ["list"],
      "success_probability": 0.0-1.0,
      "timeline": "timeframe",
      "cost": "low|medium|high"
    }},
    {{
      "name": "Conservative — Procedural",
      "description": "Procedural challenges, delay, negotiate",
      "pros": ["list"],
      "cons": ["list"],
      "success_probability": 0.0-1.0,
      "timeline": "timeframe",
      "cost": "low|medium|high"
    }}
  ],
  "recommendation": "Name of recommended option",
  "recommendation_rationale": "Why this is the best path"
}}"""

    try:
        raw = await invoke_llm("legal_strategy" if "legal_strategy" in ["legal_strategy"] else "legal_research",
                               prompt, temperature=0.2)
        start, end = raw.find("{"), raw.rfind("}") + 1
        parsed = json.loads(raw[start:end]) if start >= 0 else {}

        options = parsed.get("options", [])
        recommendation = parsed.get("recommendation", "")
        rationale = parsed.get("recommendation_rationale", "")

        recommended = f"{recommendation}: {rationale}"

        return {
            **state,
            "strategy_options": options,
            "recommended_strategy": recommended,
            "error": None,
        }
    except Exception as e:
        return {**state, "error": f"Strategy failed: {str(e)}"}


def route_after_error(state: GraphState) -> str:
    if state.get("error") and (state.get("retry_count", 0) < 2):
        return "intake"
    return END


# ─── Build the Legal Sub-Graph ────────────────────────────────────────────────

def build_legal_graph() -> StateGraph:
    g = StateGraph(GraphState)

    g.add_node("intake", intake_node)
    g.add_node("research", research_node)
    g.add_node("constitutional", constitutional_analysis_node)
    g.add_node("strategy", strategy_node)
    g.add_node("draft", draft_node)
    g.add_node("review", review_node)
    g.add_node("human_gate", human_gate_node)
    g.add_node("deliver", deliver_node)

    g.set_entry_point("intake")
    g.add_edge("intake", "research")
    g.add_edge("research", "constitutional")
    g.add_edge("constitutional", "strategy")
    g.add_edge("strategy", "draft")
    g.add_edge("draft", "review")
    g.add_conditional_edges("review", should_proceed_to_human_gate, {"human_gate": "human_gate", "error": "draft"})
    g.add_conditional_edges("human_gate", route_after_human_gate, {
        "deliver": "deliver",
        "draft": "draft",
        "end": END,
    })
    g.add_edge("deliver", END)

    return g
