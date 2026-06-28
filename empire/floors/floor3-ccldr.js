/**
 * empire/floors/floor3-ccldr.js
 *
 * Floor 3 — CCLDR / Doc Weedlaw constitutional courtroom (per
 * AssetManifest.js #3, 'ccldr', color #22c55e — filed under the manifest's
 * canonical floor number, same resolution applied to OmniGuard (4) and
 * PrimeDox AI (9): renumbering to match Derek's "Floor 4" handoff label
 * would reintroduce the exact AssetManifest/floor-registry mismatch fixed
 * earlier this session).
 *
 * Theme: blue/gold/white constitutional courtroom — precedent towers,
 * holographic law books, a balancing scales-of-justice centerpiece.
 * Pricing tiers (Digital $99 / Premium $499 / Elite $1499 CAD) are copied
 * verbatim from stripe-config.js's ccldr block, not invented here.
 *
 * Self-contained primitive-built scene (same pattern as floor1/floor4/
 * floor9) — returns { scene, camera, update, dispose }.
 */

import { createBuyButtonMesh, PaymentHotspots } from '../payments.js';

const GOLD = 0xd4af37;
const BLUE = 0x1e3a8a;
const WHITE = 0xf5f5f0;

const CCLDR_PLANS = [
  { label: 'CCLDR DIGITAL', priceLabel: '$99 CAD', paypalUrl: 'https://paypal.me/techpetcage/99CAD' },
  { label: 'CCLDR PREMIUM', priceLabel: '$499 CAD', paypalUrl: 'https://paypal.me/techpetcage/499CAD' },
  { label: 'CCLDR ELITE', priceLabel: '$1,499 CAD', paypalUrl: 'https://paypal.me/techpetcage/1499CAD' },
];

function createPrecedentTower(THREE, label, height) {
  const group = new THREE.Group();

  const pillarGeo = new THREE.BoxGeometry(0.8, height, 0.8);
  const pillarMat = new THREE.MeshStandardMaterial({
    color: WHITE,
    emissive: GOLD,
    emissiveIntensity: 0.15,
    metalness: 0.3,
    roughness: 0.4,
  });
  const pillar = new THREE.Mesh(pillarGeo, pillarMat);
  pillar.position.y = height / 2;
  group.add(pillar);

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(10, 15, 30, 0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 3;
  ctx.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);
  ctx.fillStyle = '#d4af37';
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(label, canvas.width / 2, canvas.height / 2 + 7);
  const plaqueMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true, side: THREE.DoubleSide });
  const plaque = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.7), plaqueMat);
  plaque.position.set(0, height * 0.7, 0.45);
  group.add(plaque);

  group.userData.pillarMat = pillarMat;
  return group;
}

// Holographic law book — two hinged planes (canvas-text pages) angled open.
function createLawBook(THREE, title) {
  const group = new THREE.Group();
  const pageCanvas = (side) => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(245, 245, 240, 0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 2;
    for (let y = 30; y < canvas.height - 10; y += 18) {
      ctx.beginPath();
      ctx.moveTo(16, y);
      ctx.lineTo(canvas.width - 16, y);
      ctx.stroke();
    }
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(side === 'left' ? title : 'CCLDR', canvas.width / 2, 20);
    return canvas;
  };
  const pageMat = (side) => new THREE.MeshBasicMaterial({
    map: new THREE.CanvasTexture(pageCanvas(side)),
    transparent: true,
    opacity: 0.93,
    side: THREE.DoubleSide,
  });
  const pageGeo = new THREE.PlaneGeometry(1.1, 1.4);
  const left = new THREE.Mesh(pageGeo, pageMat('left'));
  const right = new THREE.Mesh(pageGeo, pageMat('right'));
  left.position.x = -0.55;
  right.position.x = 0.55;
  left.rotation.y = 0.35;
  right.rotation.y = -0.35;
  group.add(left, right);
  return group;
}

function createScalesOfJustice(THREE) {
  const group = new THREE.Group();

  const baseMat = new THREE.MeshStandardMaterial({ color: GOLD, metalness: 1, roughness: 0.15 });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 4.2, 16), baseMat);
  pole.position.y = 2.1;
  group.add(pole);

  const beamPivot = new THREE.Group();
  beamPivot.position.y = 4;
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 3, 12), baseMat);
  beam.rotation.z = Math.PI / 2;
  beamPivot.add(beam);
  group.add(beamPivot);

  function createPan(x) {
    const panGroup = new THREE.Group();
    const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.1, 6), baseMat);
    chain.position.y = -0.55;
    panGroup.add(chain);
    const pan = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.45, 0.12, 24), baseMat);
    pan.position.y = -1.15;
    panGroup.add(pan);
    panGroup.position.x = x;
    beamPivot.add(panGroup);
    return panGroup;
  }
  const panLeft = createPan(-1.45);
  const panRight = createPan(1.45);

  return { group, beamPivot, panLeft, panRight };
}

class CourtroomAmbience {
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
    osc.frequency.value = 70; // low marble-hall hush
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.035, ctx.currentTime + 1.5);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    this.nodes = { osc, gain };
  }
  gavel() {
    const ctx = this._ensureContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = 180;
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }
  stop() {
    if (!this.nodes) return;
    const { osc, gain } = this.nodes;
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.4);
    osc.stop(this.ctx.currentTime + 0.45);
    this.nodes = null;
  }
}

export function createCcldrScene(THREE) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x05060d, 10, 55);

  const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 5, 13);

  const ambient = new THREE.AmbientLight(0x1a2030, 0.75);
  scene.add(ambient);

  const blueLight = new THREE.PointLight(BLUE, 1.8, 50);
  blueLight.position.set(-6, 5, 5);
  scene.add(blueLight);

  const goldLight = new THREE.PointLight(GOLD, 2, 50);
  goldLight.position.set(6, 5, 5);
  scene.add(goldLight);

  // MARBLE FLOOR — white/blue checker via canvas texture
  const marbleCanvas = document.createElement('canvas');
  marbleCanvas.width = 256;
  marbleCanvas.height = 256;
  const mctx = marbleCanvas.getContext('2d');
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      mctx.fillStyle = (x + y) % 2 === 0 ? '#f5f5f0' : '#dfe6f5';
      mctx.fillRect(x * 32, y * 32, 32, 32);
    }
  }
  const marbleTex = new THREE.CanvasTexture(marbleCanvas);
  marbleTex.wrapS = THREE.RepeatWrapping;
  marbleTex.wrapT = THREE.RepeatWrapping;
  marbleTex.repeat.set(6, 6);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({ map: marbleTex, metalness: 0.2, roughness: 0.35 })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  // SCALES OF JUSTICE — centerpiece, gently balances
  const { group: scales, beamPivot, panLeft, panRight } = createScalesOfJustice(THREE);
  scales.position.set(0, 0, -3);
  scene.add(scales);

  // PRECEDENT TOWERS — flank the scales
  const towers = [
    createPrecedentTower(THREE, 'CASE LAW', 4.5),
    createPrecedentTower(THREE, 'STATUTES', 5.5),
    createPrecedentTower(THREE, 'BENO-X WINS', 6.5),
    createPrecedentTower(THREE, 'TREATY LAW', 5),
  ];
  const towerRadius = 9;
  towers.forEach((t, i) => {
    const angle = (i / towers.length) * Math.PI * 2;
    t.position.set(Math.cos(angle) * towerRadius, 0, Math.sin(angle) * towerRadius - 3);
    scene.add(t);
  });

  // HOLOGRAPHIC LAW BOOKS — float around the scales
  const books = [
    createLawBook(THREE, 'CCLDR STATUTES'),
    createLawBook(THREE, 'CONSTITUTION'),
  ];
  books[0].position.set(-4, 3.2, 0);
  books[1].position.set(4, 3.2, 0);
  books.forEach((b) => scene.add(b));

  // PAYPAL BUY BUTTONS — Option A floating holographic buttons
  const hotspots = new PaymentHotspots(THREE, camera);
  CCLDR_PLANS.forEach((plan, i) => {
    const mesh = createBuyButtonMesh(THREE, { ...plan, accentColor: '#d4af37' });
    mesh.position.set(-3 + i * 3, 1.6, 6);
    scene.add(mesh);
    hotspots.add(mesh);
  });

  const audio = new CourtroomAmbience();
  let justiceTip = 0; // -1..1, click nudges it toward a side then it settles back

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  function pickScales(clientX, clientY) {
    pointer.x = (clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObjects([panLeft, panRight], true);
  }

  function onPointerDown(event) {
    audio.start();
    const hits = pickScales(event.clientX, event.clientY);
    if (!hits.length) return;
    audio.gavel();
    justiceTip = hits[0].object === panLeft || panLeft.children.includes(hits[0].object) ? -0.6 : 0.6;
  }
  window.addEventListener('mousedown', onPointerDown);

  function update() {
    const now = Date.now();
    justiceTip *= 0.97; // settles back toward balance
    beamPivot.rotation.z = justiceTip + Math.sin(now * 0.0008) * 0.03;

    goldLight.intensity = 1.8 + Math.sin(now * 0.0015) * 0.3;

    towers.forEach((t, i) => {
      t.userData.pillarMat.emissiveIntensity = 0.15 + Math.sin(now * 0.001 + i) * 0.08;
    });

    books.forEach((b, i) => {
      b.position.y = 3.2 + Math.sin(now * 0.0012 + i * 2) * 0.15;
      b.rotation.y += 0.0025 * (i % 2 === 0 ? 1 : -1);
    });

    hotspots.update();
  }

  function dispose() {
    window.removeEventListener('mousedown', onPointerDown);
    hotspots.dispose();
    audio.stop();
  }

  return { scene, camera, update, dispose };
}

export default createCcldrScene;
