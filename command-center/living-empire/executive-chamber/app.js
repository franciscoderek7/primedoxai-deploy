/* FHI Executive Chamber — Phase 1 Voice Vertical Slice
 *
 * API_BASE is empty string: all /api/* calls go to same origin (Chamber bridge
 * at port 8790). The browser no longer contacts the War Room (8787) directly.
 *
 * COUNCIL NOTE: Council currently runs all three executives for every question.
 * Executive-specific routing is a Council-layer change deferred to a future patch
 * so council-engine.js remains untouched here.
 */

const API_BASE = "";  // same-origin — hits Chamber bridge, not War Room directly

// ── Executive identity fallbacks ──────────────────────────────────────────────
const fallbackAgents = {
  primedox:  { id: "primedox",  name: "PrimeDox AI",  role: "THE SCHOLAR"    },
  vigilax:   { id: "vigilax",   name: "Vigilax AI",   role: "THE SENTINEL"   },
  soulstack: { id: "soulstack", name: "SoulStack AI", role: "THE STRATEGIST" },
};

let agents  = { ...fallbackAgents };
let current = agents.primedox;

// ── DOM refs ──────────────────────────────────────────────────────────────────
const cards            = document.querySelectorAll(".executive-card");
const stagePortrait    = document.getElementById("stagePortrait");
const stageName        = document.getElementById("stageName");
const stageRole        = document.getElementById("stageRole");
const chatTitle        = document.getElementById("chatTitle");
const messages         = document.getElementById("messages");
const input            = document.getElementById("chatInput");
const connectionStatus = document.getElementById("connectionStatus");
const identityState    = document.getElementById("identityState");
const avatarStateBadge = document.getElementById("avatarState");
const micBtn           = document.getElementById("micBtn");

// ── Voice state machine ───────────────────────────────────────────────────────
// States are independent of Council logic.
// A future 3D avatar renderer consumes them via the avatarRenderer hook below.
const AVATAR_STATES = ["IDLE", "LISTENING", "THINKING", "SPEAKING", "INTERRUPTED", "ERROR"];
let avatarState = "IDLE";
let activeAudio = null;   // current Audio element, if any
let recognition = null;   // current SpeechRecognition instance, if any

function setAvatarState(state) {
  if (!AVATAR_STATES.includes(state)) return;
  avatarState = state;
  if (avatarStateBadge) {
    avatarStateBadge.textContent   = state;
    avatarStateBadge.dataset.state = state;
  }
  if (stagePortrait) stagePortrait.dataset.state = state;
  if (micBtn)        micBtn.dataset.state        = state;
  // Future 3D hook: avatarRenderer?.onStateChange(state);
}

// ── Message rendering ─────────────────────────────────────────────────────────
function addMessage(text, type = "ai") {
  const div    = document.createElement("div");
  div.className = `message ${type}`;

  const strong = document.createElement("strong");
  strong.textContent = type === "user" ? "You:" : `${current.name}:`;

  const body = document.createTextNode(" " + text);

  div.appendChild(strong);
  div.appendChild(body);
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// ── Executive switching ───────────────────────────────────────────────────────
function setExecutive(key) {
  current = agents[key] || fallbackAgents[key];

  stagePortrait.textContent  = current.name.charAt(0);
  stagePortrait.className    = `stage-portrait ${key}`;  // reapply colour class
  stageName.textContent      = current.name;
  stageRole.textContent      = current.role || "EXECUTIVE";
  chatTitle.textContent      = current.name;

  cards.forEach(card => {
    card.classList.toggle("active", card.dataset.agent === key);
  });
  // Future 3D hook: avatarRenderer?.onExecutiveChange(current);
}

// ── Avatar load from War Room via Chamber bridge ──────────────────────────────
async function loadAvatars() {
  try {
    const response = await fetch(`${API_BASE}/api/avatars`, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const payload = await response.json();

    if (payload && Array.isArray(payload.avatars)) {
      const discovered = {};
      payload.avatars.forEach(avatar => {
        if (avatar && avatar.id) {
          discovered[avatar.id] = { ...fallbackAgents[avatar.id], ...avatar };
        }
      });
      agents = { ...fallbackAgents, ...discovered };
      connectionStatus.textContent = "WAR ROOM CONNECTED";
      identityState.textContent    = "VALIDATED";
      return true;
    }

    throw new Error("Invalid avatar payload");
  } catch (error) {
    connectionStatus.textContent = "LOCAL FALLBACK";
    identityState.textContent    = "DEMO";
    console.warn("Avatar bridge unavailable:", error.message);
    return false;
  }
}

// ── Council call — existing contract, unchanged ───────────────────────────────
async function sendToCouncil(question) {
  // Prefix the question with the active executive's identity, matching the
  // pattern the War Room already uses. Executive identity comes from the
  // validated `current` object set by setExecutive() — not from user input.
  // council-engine.js is not modified; the Council receives enriched plain text.
  const archetype = current.archetype || current.role || "EXECUTIVE";
  const domains   = Array.isArray(current.domains) && current.domains.length
    ? current.domains.join(", ")
    : archetype;

  const contextualQuestion =
    `Active executive: ${current.name} (${archetype}).\n\n` +
    `Executive specialization: ${domains}.\n\n` +
    `User question: ${question}`;

  const response = await fetch(`${API_BASE}/api/council`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: contextualQuestion }),
  });

  if (!response.ok) throw new Error(`Council API HTTP ${response.status}`);

  return response.json();
}

// ── ElevenLabs TTS — server-mediated, key never reaches browser ───────────────
async function speakResponse(text, executiveId) {
  try {
    const res = await fetch(`${API_BASE}/api/voice-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: text.slice(0, 2000),
        executive_id: executiveId,
      }),
    });

    if (!res.ok) {
      setAvatarState("IDLE");
      return;
    }

    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    activeAudio = new Audio(url);

    setAvatarState("SPEAKING");

    activeAudio.play().catch(() => {
      URL.revokeObjectURL(url);
      activeAudio = null;
      setAvatarState("IDLE");
    });

    activeAudio.onended = () => {
      URL.revokeObjectURL(url);
      activeAudio = null;
      setAvatarState("IDLE");
    };

    activeAudio.onerror = () => {
      URL.revokeObjectURL(url);
      activeAudio = null;
      setAvatarState("IDLE");
    };

  } catch {
    // TTS unavailable — text already displayed, fall back to IDLE silently
    setAvatarState("IDLE");
  }
}

// ── Main conversation pipeline ────────────────────────────────────────────────
// This function is the single entry point for both text and voice input.
// sendToCouncil() and addMessage() are called exactly as before.
async function handleMessage(text) {
  const trimmed = (text || "").trim();
  if (!trimmed) return;

  // Interrupt any active audio when a new message arrives
  if (activeAudio) {
    activeAudio.pause();
    activeAudio = null;
    setAvatarState("INTERRUPTED");
  }

  addMessage(trimmed, "user");
  input.value = "";
  setAvatarState("THINKING");

  const thinking = document.createElement("div");
  thinking.className   = "message ai thinking";
  thinking.textContent = `${current.name} is thinking…`;
  messages.appendChild(thinking);
  messages.scrollTop = messages.scrollHeight;

  try {
    const result = await sendToCouncil(trimmed);

    thinking.remove();

    let output = "";

    if (result && result.result) {
      output = typeof result.result === "string"
        ? result.result
        : JSON.stringify(result.result, null, 2);
    } else if (result && result.proposal) {
      output = typeof result.proposal === "string"
        ? result.proposal
        : JSON.stringify(result.proposal, null, 2);
    } else if (result && result.message) {
      output = result.message;
    } else {
      output = JSON.stringify(result, null, 2);
    }

    addMessage(output, "ai");

    // Preserve existing human-approval authority gate — unchanged
    if (result && result.humanApprovalRequired) {
      addMessage(
        "AUTHORITY GATE: This is a proposal only. Human approval is required before any consequential action.",
        "ai"
      );
    }

    // Voice layer — attaches after text is displayed; does not block or alter it
    if (output.trim()) {
      speakResponse(output, current.id);  // async, non-blocking
    } else {
      setAvatarState("IDLE");
    }

  } catch (error) {
    thinking.remove();
    setAvatarState("ERROR");
    addMessage(`Bridge unavailable. No action was taken. ${error.message}`, "ai");
    setTimeout(() => setAvatarState("IDLE"), 3000);
  }
}

// ── STT via Web Speech API ────────────────────────────────────────────────────
function startListening() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SR) {
    addMessage(
      "Speech recognition is not available in this browser. Use the text input below.",
      "ai"
    );
    return;
  }

  // Toggle: press mic again while LISTENING to cancel
  if (avatarState === "LISTENING" && recognition) {
    recognition.stop();
    setAvatarState("IDLE");
    return;
  }

  // Don't start if thinking or speaking
  if (avatarState === "THINKING" || avatarState === "SPEAKING") return;

  // Stop any active audio before listening
  if (activeAudio) {
    activeAudio.pause();
    activeAudio = null;
  }

  recognition = new SR();
  recognition.lang            = "en-CA";
  recognition.interimResults  = false;
  recognition.maxAlternatives = 1;
  recognition.continuous      = false;

  recognition.onstart = () => setAvatarState("LISTENING");

  recognition.onresult = (e) => {
    const transcript = e.results[0][0].transcript.trim().slice(0, 2000);
    if (transcript) {
      handleMessage(transcript);
    } else {
      setAvatarState("IDLE");
    }
  };

  recognition.onerror = (e) => {
    if (e.error === "no-speech") {
      setAvatarState("IDLE");
    } else {
      setAvatarState("ERROR");
      setTimeout(() => setAvatarState("IDLE"), 2500);
    }
    recognition = null;
  };

  recognition.onend = () => {
    if (avatarState === "LISTENING") setAvatarState("IDLE");
    recognition = null;
  };

  recognition.start();
}

// ── Event listeners ───────────────────────────────────────────────────────────
cards.forEach(card => {
  card.addEventListener("click", () => setExecutive(card.dataset.agent));
});

document.getElementById("chatForm").addEventListener("submit", event => {
  event.preventDefault();
  const text = input.value.trim();
  if (text) handleMessage(text);
});

document.querySelectorAll("[data-prompt]").forEach(button => {
  button.addEventListener("click", () => {
    input.value = button.dataset.prompt;
    input.focus();
  });
});

if (micBtn) {
  micBtn.addEventListener("click", startListening);
}

// ── Init ──────────────────────────────────────────────────────────────────────
setExecutive("primedox");
loadAvatars();
