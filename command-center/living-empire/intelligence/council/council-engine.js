#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const aiRuntime = require("./ai-runtime");

const ROOT = path.resolve(__dirname, "..");
const AVATAR_DIR = path.join(ROOT, "avatars");
const PROPOSAL_DIR = path.join(ROOT, "proposals");

const executives = ["primedox", "vigilax", "soulstack"];

function loadJSON(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function timestamp() {
  return new Date().toISOString();
}

function slug(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

async function createCouncilCase(problem, customer = "UNSPECIFIED") {
  const profiles = executives.map(id =>
    loadJSON(path.join(AVATAR_DIR, `${id}.json`))
  );

  const id = `${Date.now()}-${slug(problem).slice(0, 50)}`;

  const proposal = {
    id,
    timestamp: timestamp(),
    status: "PROPOSED",
    humanDecision: "REQUIRED",

    intake: {
      problem,
      customer
    },

    executives: profiles.map(p => ({
      id: p.id,
      name: p.name,
      archetype: p.archetype,
      domains: p.domains,
      authority: p.authority,
      assignment:
        p.id === "primedox"
          ? "Analyze knowledge, education, documentation and evidence requirements."
          : p.id === "vigilax"
          ? "Analyze security, privacy, AI-safety, fraud and operational risks."
          : "Analyze customer value, revenue potential, operations, automation and speed to market."
    })),

    councilPipeline: [
      "INTAKE",
      "CLASSIFY",
      "SPECIALIST_ANALYSIS",
      "CROSS_CHECK",
      "OPPORTUNITY_RANKING",
      "RISK_RANKING",
      "BUSINESS_CASE",
      "HUMAN_REVIEW",
      "APPROVED_OR_REJECTED",
      "EXECUTE",
      "MEASURE",
      "LEARN"
    ],

    financialExecutionAllowed: false,
    legalExecutionAllowed: false,
    securityExecutionAllowed: false,
    destructiveExecutionAllowed: false,
    productionDeploymentAllowed: false
  };

  // SPECIALIST_ANALYSIS stage — AI enrichment (additive, non-fatal)
  // Authority flags above are set before this call and cannot be
  // modified by AI output. File write always executes regardless.
  try {
    const aiResults = await aiRuntime.analyzeCouncil({ problem, profiles });
    const aiById = Object.fromEntries(aiResults.map(r => [r.id, r]));
    proposal.executives = proposal.executives.map(exec => ({
      ...exec,
      ...aiById[exec.id]
    }));
    proposal.councilPipelineStage = "SPECIALIST_ANALYSIS";
  } catch (e) {
    proposal.councilPipelineStage = "INTAKE";
    proposal.aiRuntimeStatus = "ERROR";
  }

  const output = path.join(PROPOSAL_DIR, `${id}.json`);
  fs.writeFileSync(output, JSON.stringify(proposal, null, 2) + "\n", {
    mode: 0o600
  });

  return { output, proposal };
}

const problem = process.argv.slice(2).join(" ").trim();

if (!problem) {
  console.log(`
FHI EXECUTIVE COUNCIL ENGINE

Usage:
  node council-engine.js "Describe a business problem or opportunity"

Example:
  node council-engine.js "Find the fastest legitimate cybersecurity service FHI can sell to small businesses"

The engine creates a PROPOSED case only.
No money, credentials, deployments, legal filings or production systems
are touched.
`);
  process.exit(0);
}

createCouncilCase(problem).then(result => {
  console.log("============================================================");
  console.log("FHI EXECUTIVE COUNCIL CASE CREATED");
  console.log("============================================================");
  console.log(`ID:       ${result.proposal.id}`);
  console.log(`STATUS:   ${result.proposal.status}`);
  console.log(`DECISION: ${result.proposal.humanDecision}`);
  console.log(`STAGE:    ${result.proposal.councilPipelineStage || "INTAKE"}`);
  console.log("");
  console.log("EXECUTIVE ANALYSIS:");
  console.log("");

  for (const executive of result.proposal.executives) {
    console.log(`--- ${executive.name} — ${executive.archetype} ---`);
    if (executive.analysisStatus === "COMPLETE" && executive.analysis) {
      console.log(executive.analysis);
    } else if (executive.analysisStatus === "UNAVAILABLE") {
      console.log(`[${executive.analysisError || "AI analysis unavailable"}]`);
    } else if (executive.analysisStatus === "ERROR") {
      console.log("[AI analysis unavailable — proposal recorded]");
    } else {
      console.log("[Analysis pending human review]");
    }
    console.log("");
  }

  console.log(`CASE FILE: ${result.output}`);
  console.log("");
  console.log("AUTHORITY:");
  console.log("AI analysis/recommendation: ALLOWED");
  console.log("Financial execution:        BLOCKED");
  console.log("Legal execution:            BLOCKED");
  console.log("Security execution:         BLOCKED");
  console.log("Destructive execution:      BLOCKED");
  console.log("Production deployment:      BLOCKED");
  console.log("");
  console.log("HUMAN DECISION REQUIRED BEFORE ANY CONSEQUENTIAL ACTION.");
  console.log("============================================================");
}).catch(err => {
  console.error("Council engine error:", err.message);
  process.exit(1);
});
