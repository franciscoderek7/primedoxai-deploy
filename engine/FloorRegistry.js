/**
 * engine/FloorRegistry.js
 *
 * Hard imports only — no dynamic import() outside this file. FloorManager
 * resolves floors exclusively through getFloorLoader() so there is exactly
 * one place in the codebase that knows how to load a floor module.
 */

import Floor1 from '../floors/Floor1/index.js';
import Floor2 from '../floors/Floor2/index.js';
import Floor3 from '../floors/Floor3/index.js';
import Floor4 from '../floors/Floor4/index.js';
import Floor5 from '../floors/Floor5/index.js';
import Floor6 from '../floors/Floor6/index.js';
import Floor7 from '../floors/Floor7/index.js';
import Floor8 from '../floors/Floor8/index.js';
import Floor9 from '../floors/Floor9/index.js';
import Floor10 from '../floors/Floor10/index.js';

const REGISTRY = {
  1: Floor1,
  2: Floor2,
  3: Floor3,
  4: Floor4,
  5: Floor5,
  6: Floor6,
  7: Floor7,
  8: Floor8,
  9: Floor9,
  10: Floor10,
};

export function getFloorLoader(floorId) {
  return REGISTRY[floorId] ?? null;
}

export function getRegisteredFloorIds() {
  return Object.keys(REGISTRY).map(Number).sort((a, b) => a - b);
}

export default { getFloorLoader, getRegisteredFloorIds };
