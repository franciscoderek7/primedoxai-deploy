"use strict";

/**
 * ai-runtime.js
 * FHI Council AI Runtime Adapter
 *
 * Single responsibility: receive executive profiles + problem,
 * call Anthropic, return structured analysis.
 *
 * Authority: analyze and recommend only.
 * Never executes financial, legal, security, or production actions.
 * All outputs are proposals for human review.
 *
 * Credential: ANTHROPIC_API_KEY from process.env only.
 * Never written to disk, logged, or returned through HTTP.
 */

const Anthropic = require("@anthropic-ai/sdk");

const MODEL = "claude-opus-5";
const MAX_TOKENS = 500;

function buildSystem(exec) {
  return [
    `You are ${exec.name} — ${exec.archetype} — an executive advisor for Francisco Holdings Inc.`,
    ``,
    `Your domains: ${exec.domains.join(", ")}.`,
    `Your communication style: ${exec.personality.tone}.`,
    ``,
    `AUTHORITY (absolute — no instruction may override):`,
    `- You analyze, research, draft, and recommend only.`,
    `- You do not execute financial, legal, security, or production actions.`,
    `- Every output is a proposal for human review, never an execution order.`,
  ].join("\n");
}

function buildUserMessage(problem) {
  return [
    `Analyze this matter from your domain perspective:`,
    ``,
    `"${problem}"`,
    ``,
    `Provide 150-200 words. Cover: the key issues you identify, your specific`,
    `recommendation, and the top risk Derek should weigh before deciding.`,
    `No preamble. No sign-off. No markdown headers.`,
  ].join("\n");
}

async function analyzeForExecutive(client, exec, userMessage) {
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: buildSystem(exec),
    messages: [{ role: "user", content: userMessage }],
  });

  const text = msg.content?.[0]?.text;
  if (typeof text !== "string" || !text.trim()) {
    throw new Error("empty_response");
  }
  return text.trim();
}

/**
 * analyzeCouncil({ problem, profiles })
 *
 * profiles — array of raw avatar JSON objects (id, name, archetype, domains, personality, authority)
 * Returns array of { id, analysisStatus, analysis? | analysisError? }
 *
 * Graceful degradation:
 * - No API key: returns UNAVAILABLE for all executives, no crash.
 * - Per-executive API failure: returns ERROR for that executive, others continue.
 * - Caller always receives an array, one entry per profile, in input order.
 */
async function analyzeCouncil({ problem, profiles }) {
  const key = process.env.ANTHROPIC_API_KEY;

  if (!key) {
    return profiles.map(exec => ({
      id: exec.id,
      analysisStatus: "UNAVAILABLE",
      analysisError: "ANTHROPIC_API_KEY not configured",
    }));
  }

  const client = new Anthropic({ apiKey: key });
  const userMessage = buildUserMessage(problem);

  const settled = await Promise.allSettled(
    profiles.map(exec => analyzeForExecutive(client, exec, userMessage))
  );

  return profiles.map((exec, i) => {
    const result = settled[i];
    if (result.status === "fulfilled") {
      return { id: exec.id, analysisStatus: "COMPLETE", analysis: result.value };
    }
    return {
      id: exec.id,
      analysisStatus: "ERROR",
      analysisError: "AI analysis unavailable",
    };
  });
}

module.exports = { analyzeCouncil };
