/**
 * empire/fallbacks/TextureFallback.js
 *
 * Procedural CanvasTexture generator used whenever a floor's real texture
 * file (manifest `texture.path`) fails to load. Draws a deterministic
 * pattern derived from the floor's themeColor so every floor still reads as
 * visually distinct even with zero real art assets.
 *
 * Requires THREE to be passed in by the caller (AssetLoader) — this module
 * does not import three.js itself so it stays usable in a non-bundled
 * <script type="module"> context where THREE is loaded globally.
 */

export function generateFallbackTexture(THREE, floor, size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const color = floor.themeColor || '#888888';

  // Base fill
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, size, size);

  // Diagonal grid panels in the floor's theme color
  const panels = 8;
  const step = size / panels;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.35;
  for (let i = 0; i <= panels; i++) {
    ctx.beginPath();
    ctx.moveTo(i * step, 0);
    ctx.lineTo(i * step, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * step);
    ctx.lineTo(size, i * step);
    ctx.stroke();
  }

  // Floor number watermark
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = color;
  ctx.font = `bold ${Math.floor(size / 4)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(floor.floor), size / 2, size / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.userData = { procedural: true, floor: floor.floor, slot: 'texture' };
  return texture;
}
