/**
 * empire/floors/floor1-francisco-holdings.js
 *
 * Floor 1 — Francisco Holdings Inc. HQ (ground floor / lobby), per
 * AssetManifest.js's canonical numbering (#1, 'francisco-holdings', color
 * #d4af37, toneProfile 'grand-lobby'). Floor-registry.js previously had
 * OmniGuard squatting on the live-demo's floor-1 slot with a note flagging
 * it as a probably-wrong override; this module fills the slot it was
 * always meant to hold, and floor-registry.js was updated alongside this
 * file to move OmniGuard back to its manifest floor (4).
 *
 * Stat panel figures are pulled verbatim from francisco-holdings-site/
 * francisco-holdings-expanded.html's own published meta description and
 * BENO-X section (45+ divisions, 392-floor tower, $2.4M ARR, 200+ cases /
 * BENO-X Constitutional Cannabis Victory) — not invented here.
 *
 * Self-contained primitive-built scene (same pattern as floor4-omniguard.js
 * and floor9-primedox-ai.js) — returns { scene, camera, update, dispose }
 * for engine.js / scene.js to mount and drive. No external asset besides
 * the phoenix logo texture, which falls back to a procedural gold disc if
 * the image fails to load (no network dependency required to render).
 */

const GOLD = 0xffd700;
const PLATINUM = 0xe5e4e2;
const SILVER = 0xc0c0c0;
const EMERALD = 0x50c878;
const LOGO_TEXTURE_PATH = '../fh-logo-phoenix.webp'; // relative to skyscraper-3d.html

function createGoldParticleDust(THREE, count = 600) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 1] = Math.random() * 16;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: GOLD,
    size: 0.045,
    transparent: true,
    opacity: 0.45,
    sizeAttenuation: true,
  });
  return new THREE.Points(geo, mat);
}

// Procedural canvas-texture holographic stat panel — same technique
// floor4-omniguard.js uses, recolored to the gold/platinum/emerald palette.
function createHoloPanel(THREE, title, value) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(10, 8, 2, 0.55)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
  ctx.fillStyle = '#e8d9a0';
  ctx.font = '26px monospace';
  ctx.fillText(title, 28, 64);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 52px monospace';
  ctx.fillText(value, 28, 150);
  ctx.fillStyle = '#50C878';
  ctx.font = '20px monospace';
  ctx.fillText('FRANCISCO HOLDINGS INC.', 28, 210);

  const texture = new THREE.CanvasTexture(canvas);
  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
  });
  const geo = new THREE.PlaneGeometry(2.8, 1.4);
  return new THREE.Mesh(geo, mat);
}

function createPhoenixLogo(THREE) {
  const geo = new THREE.CircleGeometry(1.6, 48);
  // Procedural gold-disc fallback drawn first so the mesh never renders
  // blank while (or if) the real logo texture fails to load.
  const fallbackCanvas = document.createElement('canvas');
  fallbackCanvas.width = 256;
  fallbackCanvas.height = 256;
  const ctx = fallbackCanvas.getContext('2d');
  const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
  grad.addColorStop(0, '#fff6d0');
  grad.addColorStop(0.5, '#ffd700');
  grad.addColorStop(1, '#5a4500');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(128, 128, 124, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0a0a0a';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('FH', 128, 140);

  const mat = new THREE.MeshBasicMaterial({
    map: new THREE.CanvasTexture(fallbackCanvas),
    transparent: true,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(0, 5.5, 0);

  new THREE.TextureLoader().load(
    LOGO_TEXTURE_PATH,
    (tex) => {
      mat.map = tex;
      mat.needsUpdate = true;
    },
    undefined,
    () => {
      /* fallback gold disc stays mounted — already rendering, nothing to do */
    }
  );

  return mesh;
}

function createElevatorLightBeam(THREE) {
  const geo = new THREE.CylinderGeometry(0.35, 0.35, 30, 16, 1, true);
  const mat = new THREE.MeshBasicMaterial({
    color: GOLD,
    transparent: true,
    opacity: 0.12,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const beam = new THREE.Mesh(geo, mat);
  beam.position.set(0, 14, -8);
  return beam;
}

class AmbientDrone {
  constructor() {
    this.ctx = null;
    this.nodes = null;
  }
  _ensureContext() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }
  start() {
    if (this.nodes) return;
    const ctx = this._ensureContext();
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 55; // deep drone fundamental
    const shimmer = ctx.createOscillator();
    shimmer.type = 'sine';
    shimmer.frequency.value = 880; // gold shimmer overtone
    const shimmerGain = ctx.createGain();
    shimmerGain.gain.value = 0.015;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 1.2);
    osc.connect(gain);
    shimmer.connect(shimmerGain).connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    shimmer.start();
    this.nodes = { osc, shimmer, gain };
  }
  chime() {
    const ctx = this._ensureContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 1318.5; // E6 — soft hover chime
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  }
  stop() {
    if (!this.nodes) return;
    const { osc, shimmer, gain } = this.nodes;
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
    osc.stop(this.ctx.currentTime + 0.55);
    shimmer.stop(this.ctx.currentTime + 0.55);
    this.nodes = null;
  }
}

export function createFranciscoHoldingsScene(THREE) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x05040a, 12, 55);

  const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 5, 13);

  const ambient = new THREE.AmbientLight(0x2a2418, 0.7);
  scene.add(ambient);

  const goldLight = new THREE.PointLight(GOLD, 2.2, 50);
  goldLight.position.set(-5, 6, 4);
  scene.add(goldLight);

  const emeraldLight = new THREE.PointLight(EMERALD, 1.2, 40);
  emeraldLight.position.set(5, 4, 4);
  scene.add(emeraldLight);

  // REFLECTIVE CHROME FLOOR PLATFORM — mirrors the holograms above
  const floorGeo = new THREE.CircleGeometry(16, 64);
  const floorMat = new THREE.MeshStandardMaterial({
    color: PLATINUM,
    metalness: 0.95,
    roughness: 0.08,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  // GOLD PARTICLE DUST
  const dust = createGoldParticleDust(THREE);
  scene.add(dust);

  // ELEVATOR LIGHT BEAM — gold shaft rising through the tower
  const beam = createElevatorLightBeam(THREE);
  scene.add(beam);

  // FLOATING HOLOGRAPHIC PHOENIX LOGO — rotates slowly, gold glow
  const logo = createPhoenixLogo(THREE);
  scene.add(logo);
  let logoExpanded = false;

  // ORBITING HOLOGRAPHIC STAT PANELS (verified figures — see file header)
  const stats = [
    { mesh: createHoloPanel(THREE, 'EMPIRE BRANDS', '45+'), angle: 0 },
    { mesh: createHoloPanel(THREE, 'TOWER FLOORS', '392'), angle: (Math.PI * 2) / 4 },
    { mesh: createHoloPanel(THREE, 'ARR 2026', '$2.4M'), angle: (Math.PI * 4) / 4 },
    { mesh: createHoloPanel(THREE, 'BENO-X CASES WON', '200+'), angle: (Math.PI * 6) / 4 },
  ];
  const orbitRadius = 6.5;
  stats.forEach((s) => {
    s.mesh.position.set(Math.cos(s.angle) * orbitRadius, 3.4, Math.sin(s.angle) * orbitRadius - 4);
    s.mesh.lookAt(0, 3.4, -4);
    scene.add(s.mesh);
  });
  let activeStatRotation = new Map();

  // RAYCAST INTERACTION — click logo to "expand" (scale + brighten), click a
  // stat panel to rotate it (reveal gesture; the panel's content stays the
  // canvas texture already drawn, per the spec's "rotates to reveal" cue).
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const audio = new AmbientDrone();
  let hoveredObject = null;

  function pickTargets(clientX, clientY) {
    pointer.x = (clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObjects([logo, ...stats.map((s) => s.mesh)]);
  }

  function onPointerMove(event) {
    const hits = pickTargets(event.clientX, event.clientY);
    const next = hits.length ? hits[0].object : null;
    if (next !== hoveredObject) {
      hoveredObject = next;
      if (hoveredObject) audio.chime();
    }
  }

  function onPointerDown(event) {
    audio.start(); // first-gesture start, per autoplay policy
    const hits = pickTargets(event.clientX, event.clientY);
    if (!hits.length) return;
    const target = hits[0].object;
    if (target === logo) {
      logoExpanded = !logoExpanded;
    } else {
      const stat = stats.find((s) => s.mesh === target);
      if (stat) {
        const current = activeStatRotation.get(stat.mesh) || 0;
        activeStatRotation.set(stat.mesh, current + Math.PI);
      }
    }
  }

  // Touch parity — single tap behaves like click, no drag-rotate gesture
  // is wired here since camera orbiting isn't part of this floor's spec.
  function onTouchStart(event) {
    const t = event.touches[0];
    if (!t) return;
    onPointerDown({ clientX: t.clientX, clientY: t.clientY });
  }

  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mousedown', onPointerDown);
  window.addEventListener('touchstart', onTouchStart, { passive: true });

  function update() {
    const now = Date.now();
    logo.rotation.y += 0.006;
    const targetScale = logoExpanded ? 1.6 : 1;
    logo.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);
    logo.position.y = 5.5 + Math.sin(now * 0.0012) * 0.15;

    goldLight.intensity = 2.0 + Math.sin(now * 0.0018) * 0.3;

    stats.forEach((s, i) => {
      s.mesh.position.y = 3.4 + Math.sin(now * 0.0014 + i) * 0.12;
      const targetY = activeStatRotation.get(s.mesh) || 0;
      s.mesh.rotation.y += (targetY - s.mesh.rotation.y) * 0.1;
    });

    dust.rotation.y += 0.0006;
    beam.material.opacity = 0.1 + Math.sin(now * 0.002) * 0.04;
  }

  function dispose() {
    window.removeEventListener('mousemove', onPointerMove);
    window.removeEventListener('mousedown', onPointerDown);
    window.removeEventListener('touchstart', onTouchStart);
    audio.stop();
  }

  return { scene, camera, update, dispose };
}

export default createFranciscoHoldingsScene;
