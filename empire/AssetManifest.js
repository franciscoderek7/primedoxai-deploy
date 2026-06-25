/**
 * empire/AssetManifest.js
 *
 * Authoritative per-floor asset manifest for the Francisco Holdings Inc.
 * 45-floor skyscraper (data source: EMPIRE.md "1. HOLDING STRUCTURE" table
 * and the 8 named swarm-site entries). No 3D scene exists yet to render this
 * — this manifest + AssetLoader.js + the procedural fallbacks are the asset
 * pipeline a future Three.js scene will consume.
 *
 * Every floor declares the same 5 asset slots: texture, hdri, audio, model,
 * shader. None of the referenced binary files exist in the repo today, so
 * AssetLoader is expected to hit its procedural fallback generator for every
 * slot on every floor until real assets are produced and dropped at
 * ASSET_BASE_PATH.
 */

export const ASSET_BASE_PATH = '/assets/empire/';

function mkFloor(floor, id, name, company, tier, status, domain, themeColor, opts = {}) {
  const slug = id;
  return {
    floor,
    id,
    name,
    company,
    tier,           // 'A' | 'B' (per EMPIRE.md revenue-priority tiering)
    status,         // verbatim status string from EMPIRE.md
    domain: domain || null,
    themeColor,
    secret: !!opts.secret,
    assets: {
      texture: { name: `${slug}-texture`, path: `textures/${slug}.jpg`, fallback: 'texture' },
      hdri: { name: `${slug}-env`, path: `hdri/${slug}.hdr`, fallback: 'hdri' },
      audio: { name: `${slug}-ambience`, path: `audio/${slug}.mp3`, fallback: 'audio', toneProfile: opts.toneProfile || 'ambient-pad' },
      model: { name: `${slug}-model`, path: `models/${slug}.glb`, fallback: 'model', geometryHint: opts.geometryHint || 'desk' },
      shader: { name: `${slug}-shader`, fallback: 'shader' },
    },
  };
}

export const FLOORS = [
  mkFloor(1, 'francisco-holdings', 'Francisco Holdings Inc.', 'Francisco Holdings Inc.', 'A', 'LIVE — 45-FLOOR SKYSCRAPER + STRIPE/PAYPAL PER FLOOR', 'franciscoholdingsinc.com', '#d4af37', { toneProfile: 'grand-lobby', geometryHint: 'reception-desk' }),
  mkFloor(2, 'cleanswarm', 'CleanSwarm', 'CleanSwarm', 'A', 'LIVE', 'cleanswarm.ca', '#10b981', { toneProfile: 'industrial-hum', geometryHint: 'cleaning-bot' }),
  mkFloor(3, 'ccldr', 'CCLDR', 'CCLDR', 'A', 'LIVE + REFERRAL ENGINE + EDUCATION HUB', 'franciscoderek7.github.io/Ccldr-net/', '#22c55e', { toneProfile: 'library-quiet', geometryHint: 'bookshelf' }),
  mkFloor(4, 'omniguard', 'OmniGuard', 'OmniGuard', 'B', 'REBRANDING (was OmniaGuard)', 'omniaguard.com', '#4A90E2', { toneProfile: 'soc-pulse', geometryHint: 'server-rack' }),
  mkFloor(5, 'beno-x', 'BENO-X / Doc Weedlaw', 'BENO-X / Doc Weedlaw', 'A', 'LIVE', 'franciscoderek7.github.io/Ccldr-net/', '#22c55e', { toneProfile: 'library-quiet', geometryHint: 'desk' }),
  mkFloor(6, 'vigilax', 'VIGILAX', 'VIGILAX', 'B', 'LIVE — PRICING UPDATED + STRIPE LIVE', 'franciscoderek7.github.io/vigilax/', '#ef4444', { toneProfile: 'soc-pulse', geometryHint: 'monitor-wall' }),
  mkFloor(7, 'kiaros', 'Kiaros', 'Kiaros', 'B', 'LIVE — STRIPE LIVE + PAYPAL.ME DIRECT', 'franciscoderek7.github.io/kiaros/', '#8b5cf6', { toneProfile: 'consulting-calm', geometryHint: 'meeting-table' }),
  mkFloor(8, 'weedlaw-education', 'Weedlaw Education', 'Weedlaw Education', 'A', 'LIVE', 'franciscoderek7.github.io/weedlaw-education/', '#22c55e', { toneProfile: 'lecture-hall', geometryHint: 'podium' }),
  mkFloor(9, 'primedox-ai', 'PrimeDox AI', 'PrimeDox AI', 'A', 'LIVE', 'franciscoderek7.github.io/primedox/', '#00d4ff', { toneProfile: 'ai-chime', geometryHint: 'terminal' }),
  mkFloor(10, 'zprimedoxaihq', 'ZPrimeDoxAI HQ', 'ZPrimeDoxAI HQ', 'A', 'LIVE — CONCIERGE DEPLOYED', 'zprimedoxaihq.com', '#00d4ff', { toneProfile: 'ai-chime', geometryHint: 'concierge-desk' }),
  mkFloor(11, 'vault-velocity-auto', 'Vault Velocity Auto', 'Vault Velocity Auto', 'A', 'LIVE', 'franciscoderek7.github.io/vaultvelocityauto/', '#f59e0b', { toneProfile: 'garage-ambience', geometryHint: 'car-lift' }),
  mkFloor(12, 'techpetcage', 'TechPetCage', 'TechPetCage', 'A', 'LIVE', 'franciscoderek7.github.io/techpetcage/', '#06b6d4', { toneProfile: 'soft-chime', geometryHint: 'smart-kennel' }),
  mkFloor(13, 'techpackcage', 'TechPackCage', 'TechPackCage', 'A', 'LIVE', 'franciscoderek7.github.io/techpackcage/', '#06b6d4', { toneProfile: 'soft-chime', geometryHint: 'shipping-crate' }),
  mkFloor(14, 'mindshift-makayla', 'MindShift by Michaella', 'MindShift by Michaella', 'A', 'LIVE', 'franciscoderek7.github.io/mindshift-makayla/', '#ec4899', { toneProfile: 'wellness-pad', geometryHint: 'lounge-chair' }),
  mkFloor(15, 'soulstack', 'SoulStack.ai', 'SoulStack.ai', 'B', 'PENDING', 'soulstack.ai', '#c0c0c0', { toneProfile: 'observer-drone', geometryHint: 'data-orb' }),

  // Floors 16-23: the 8 named swarm sites (EMPIRE.md lines ~239-246)
  mkFloor(16, 'space-swarm', 'Space Swarm', 'space-swarm-site (Space Ops AI)', 'B', 'LIVE', null, '#1e3a8a', { toneProfile: 'deep-space-drone', geometryHint: 'satellite-model' }),
  mkFloor(17, 'auto-swarm', 'Auto Swarm', 'auto-swarm-site (AV Intelligence)', 'B', 'LIVE', null, '#0ea5e9', { toneProfile: 'industrial-hum', geometryHint: 'autonomous-car' }),
  mkFloor(18, 'quantum-swarm', 'Quantum Swarm', 'quantum-swarm-site (Quantum AI)', 'B', 'LIVE', null, '#7c3aed', { toneProfile: 'quantum-shimmer', geometryHint: 'qubit-lattice' }),
  mkFloor(19, 'biotech-swarm', 'Biotech Swarm', 'biotech-swarm-site (Drug Discovery AI)', 'B', 'LIVE', null, '#16a34a', { toneProfile: 'lab-hum', geometryHint: 'centrifuge' }),
  mkFloor(20, 'health-swarm', 'Health Swarm', 'health-swarm-site (Clinical AI)', 'B', 'LIVE', null, '#f43f5e', { toneProfile: 'clinical-beep', geometryHint: 'exam-table' }),
  mkFloor(21, 'fintech-swarm', 'Fintech Swarm', 'fintech-swarm-site (Payment AI)', 'B', 'LIVE', null, '#eab308', { toneProfile: 'trading-floor', geometryHint: 'ticker-board' }),
  mkFloor(22, 'energy-swarm', 'Energy Swarm', 'energy-swarm-site (Renewables AI)', 'B', 'LIVE', null, '#84cc16', { toneProfile: 'turbine-hum', geometryHint: 'turbine-model' }),
  mkFloor(23, 'logistics-swarm', 'Logistics Swarm', 'logistics-swarm-site (Supply Chain AI)', 'B', 'LIVE', null, '#a3a3a3', { toneProfile: 'warehouse-hum', geometryHint: 'pallet-rack' }),

  // Floors 24-44: reserved expansion floors, per EMPIRE.md "[Floors 14-44] ... COMING SOON"
  ...Array.from({ length: 44 - 24 + 1 }, (_, i) => {
    const n = 24 + i;
    return mkFloor(n, `coming-soon-${n}`, `Floor ${n} — Coming Soon`, 'Unannounced expansion swarm', 'B', 'COMING SOON — shown in skyscraper', null, '#555555', { toneProfile: 'silent', geometryHint: 'placeholder-block' });
  }),

  // Floor 45: secret, Konami-code-gated
  mkFloor(45, 'francisco-phoenix', 'Francisco Phoenix', 'Francisco Phoenix (Dynasty-level equity partner)', 'B', 'SECRET — Konami code only', null, '#ff0033', { secret: true, toneProfile: 'phoenix-rise', geometryHint: 'phoenix-statue' }),
];

export const TOTAL_FLOORS = FLOORS.length;

export function getFloor(floorNumber) {
  return FLOORS.find((f) => f.floor === floorNumber) || null;
}

export function getFloorById(id) {
  return FLOORS.find((f) => f.id === id) || null;
}

export function getAdjacentFloors(floorNumber, radius = 1) {
  return FLOORS.filter((f) => Math.abs(f.floor - floorNumber) <= radius && f.floor !== floorNumber);
}

export function getVisibleFloors() {
  return FLOORS.filter((f) => !f.secret);
}

export default { ASSET_BASE_PATH, FLOORS, TOTAL_FLOORS, getFloor, getFloorById, getAdjacentFloors, getVisibleFloors };
