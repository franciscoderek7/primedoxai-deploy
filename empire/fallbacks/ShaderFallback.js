/**
 * empire/fallbacks/ShaderFallback.js
 *
 * Procedural material fallback used whenever a floor's custom shader fails
 * to load/compile. Returns a plain THREE.MeshStandardMaterial tuned from
 * the floor's themeColor — visually plausible under any lighting rig
 * without needing a real ShaderMaterial/GLSL pair to exist.
 *
 * Requires THREE to be passed in by the caller (AssetLoader).
 */

export function generateFallbackShader(THREE, floor, extraParams = {}) {
  const material = new THREE.MeshStandardMaterial({
    color: floor.themeColor || '#888888',
    metalness: 0.4,
    roughness: 0.6,
    emissive: floor.secret ? floor.themeColor : '#000000',
    emissiveIntensity: floor.secret ? 0.3 : 0,
    ...extraParams,
  });
  material.userData = { procedural: true, floor: floor.floor, slot: 'shader' };
  return material;
}
