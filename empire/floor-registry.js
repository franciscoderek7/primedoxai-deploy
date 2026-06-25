/**
 * empire/floor-registry.js
 *
 * Maps a floor number to its Three.js scene module, dynamically import()'d
 * the first time that floor is visited and cached after that.
 *
 * FLOOR 1 OVERRIDE (direct instruction, not a bug): Derek explicitly said
 * "Wire floor4-omniguard.js as Floor 1" for this live skyscraper-demo
 * registry. That deliberately does NOT match AssetManifest.js, where
 * OmniGuard is Floor 4 and Floor 1 is Francisco Holdings Inc. (the parent
 * holding company / lobby), per EMPIRE.md's Holding Structure table.
 * AssetManifest.js governs the asset-loading pipeline; this registry
 * governs which scene the elevator shows for a given floor number in the
 * live demo — the two are intentionally decoupled per Derek's instruction.
 *
 * Floor 9 (PrimeDox AI HQ, floor9-primedox-ai.js) is filed under its
 * AssetManifest.js number (9), not the "Floor 2" label it arrived under —
 * same "keep manifest numbers" resolution applied to every floor scene
 * except the OmniGuard override above.
 */

const REGISTRY = {
  1: {
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
