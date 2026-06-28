/**
 * empire/floor-registry.js
 *
 * Maps a floor number to its Three.js scene module, dynamically import()'d
 * the first time that floor is visited and cached after that.
 *
 * RESOLVED FLOOR-1 OVERRIDE: this registry previously wired
 * floor4-omniguard.js to key 1 as a live-demo-only override, flagged in
 * comments as a likely mismatch against AssetManifest.js (Floor 1 =
 * Francisco Holdings Inc., Floor 4 = OmniGuard, per EMPIRE.md's Holding
 * Structure table). Now that floor1-francisco-holdings.js exists, both
 * floors are filed under their real manifest numbers and the override
 * comment no longer applies.
 */

const REGISTRY = {
  1: {
    loader: () => import('./floors/floor1-francisco-holdings.js'),
    exportName: 'createFranciscoHoldingsScene',
    label: 'Francisco Holdings Inc.',
  },
  4: {
    loader: () => import('./floors/floor4-omniguard.js'),
    exportName: 'createOmniGuardScene',
    label: 'OmniGuard',
  },
  9: {
    loader: () => import('./floors/floor9-primedox-ai.js'),
    exportName: 'createPrimeDoxHQScene',
    label: 'PrimeDox AI HQ',
  },
};

const sceneCache = new Map();

export function getRegisteredFloors() {
  return Object.keys(REGISTRY).map(Number).sort((a, b) => a - b);
}

export function getFloorLabel(floorNumber) {
  return REGISTRY[floorNumber]?.label ?? null;
}

export function isFloorLoaded(floorNumber) {
  return sceneCache.has(floorNumber);
}

export async function loadFloorScene(floorNumber, THREE) {
  if (sceneCache.has(floorNumber)) return sceneCache.get(floorNumber);

  const entry = REGISTRY[floorNumber];
  if (!entry) {
    throw new Error(`floor-registry: no scene registered for floor ${floorNumber}`);
  }

  const mod = await entry.loader();
  const factory = mod[entry.exportName];
  if (typeof factory !== 'function') {
    throw new Error(`floor-registry: "${entry.exportName}" not exported from floor ${floorNumber} module`);
  }

  const built = factory(THREE);
  sceneCache.set(floorNumber, built);
  return built;
}

export default { getRegisteredFloors, getFloorLabel, isFloorLoaded, loadFloorScene };
