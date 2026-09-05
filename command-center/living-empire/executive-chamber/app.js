const API_BASE = "http://127.0.0.1:8787";

const fallbackAgents = {
  primedox: {
    id: "primedox",
    name: "PrimeDox AI",
    role: "THE SCHOLAR"
  },
  vigilax: {
    id: "vigilax",
    name: "Vigilax AI",
    role: "THE SENTINEL"
  },
  soulstack: {
    id: "soulstack",
    name: "SoulStack AI",
    role: "THE STRATEGIST"
  }
};

let agents = { ...fallbackAgents };
let current = agents.primedox;

const cards = document.querySelectorAll(".executive-card");
const stagePortrait = document.getElementById("stagePortrait");
const stageName = document.getElementById("stageName");
const stageRole = document.getElementById("stageRole");
const chatTitle = document.getElementById("chatTitle");
const messages = document.getElementById("messages");
const input = document.getElementById("chatInput");
const connectionStatus = document.getElementById("connectionStatus");
const identityState = document.getElementById("identityState");

function addMessage(text, type = "ai") {
  const div = document.createElement("div");
  div.className = `message ${type}`;

  const strong = document.createElement("strong");
  const body = document.createTextNode(text);

  div.appendChild(strong);
  div.appendChild(body);

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function setExecutive(key) {
  current = agents[key] || fallbackAgents[key];

  stagePortrait.textContent = current.name.charAt(0);
  stageName.textContent = current.name;
  stageRole.textContent = current.role || "EXECUTIVE";
  chatTitle.textContent = current.name;

  cards.forEach(card => {
    card.classList.toggle("active", card.dataset.agent === key);
  });
}

async function loadAvatars() {
  try {
    const response = await fetch(`${API_BASE}/api/avatars`, {
      method: "GET",
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Avatar API HTTP ${response.status}`);
    }

    const payload = await response.json();

    if (payload && Array.isArray(payload.avatars)) {
      const discovered = {};

      payload.avatars.forEach(avatar => {
        if (avatar && avatar.id) {
          discovered[avatar.id] = {
            ...fallbackAgents[avatar.id],
            ...avatar
          };
        }
      });

      agents = {
        ...fallbackAgents,
        ...discovered
      };

      connectionStatus.textContent = "WAR ROOM CONNECTED";
      identityState.textContent = "VALIDATED";
      return true;
    }

    throw new Error("Invalid avatar payload");
  } catch (error) {
    connectionStatus.textContent = "LOCAL FALLBACK";
    identityState.textContent = "DEMO";
    console.warn("Avatar bridge unavailable:", error.message);
    return false;
  }
}

async function sendToCouncil(question) {
  const response = await fetch(`${API_BASE}/api/council`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      question
    })
  });

  if (!response.ok) {
    throw new Error(`Council API HTTP ${response.status}`);
  }

  return response.json();
}

async function handleMessage(text) {
  addMessage(text, "user");
  input.value = "";

  const thinking = document.createElement("div");
  thinking.className = "message ai";
  thinking.textContent = `${current.name} is thinking...`;
  messages.appendChild(thinking);
  messages.scrollTop = messages.scrollHeight;

  try {
    const result = await sendToCouncil(text);

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

    if (result && result.humanApprovalRequired) {
      addMessage(
        "AUTHORITY GATE: This is a proposal only. Human approval is required before any consequential action.",
        "ai"
      );
    }

  } catch (error) {
    thinking.remove();

    addMessage(
      `Bridge unavailable. No action was taken. ${error.message}`,
      "ai"
    );
  }
}

cards.forEach(card => {
  card.addEventListener("click", () => {
    setExecutive(card.dataset.agent);
  });
});

document.getElementById("chatForm").addEventListener("submit", event => {
  event.preventDefault();

  const text = input.value.trim();

  if (!text) {
    return;
  }

  handleMessage(text);
});

document.querySelectorAll("[data-prompt]").forEach(button => {
  button.addEventListener("click", () => {
    input.value = button.dataset.prompt;
    input.focus();
  });
});

setExecutive("primedox");

loadAvatars();
