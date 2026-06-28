/**
 * empire/floors/floor9-primedox-ai.js
 *
 * Floor 9 — PrimeDox AI HQ (AI routing + concierge control center)
 * Three.js scene module.
 *
 * NOTE ON FLOOR NUMBER: handed off labeled "Floor 2," filed under Floor 9 to
 * match AssetManifest.js (per Derek's decision to keep manifest numbers as
 * authoritative rather than renumber per incoming scene labels -- same
 * resolution applied to the OmniGuard scene, which arrived labeled "Floor 1"
 * and was filed under its manifest floor, 4).
 *
 * Self-contained primitive-built scene (does not depend on
 * empire/AssetLoader.js) — returns { scene, camera, update } for a future
 * engine.js to mount and drive.
 *
 * ASSEMBLY-LINE ADDITIONS (Derek's "BUILD FOUR 3D SITES" order, SITE 3
 * spec: "robots building documents on conveyor belts, click to generate"):
 * a conveyor belt now carries document panels past a robot arm that stamps
 * each one; clicking the belt spawns a fresh document immediately ("click
 * to generate"). Pricing-tier buy buttons (paypal.me/techpetcage amounts
 * copied verbatim from stripe-config.js's zprimedox block — the same
 * standardized tiers used on zprimedoxaihq.com) use the shared
 * empire/payments.js Option A floating-button system.
 */

import { createBuyButtonMesh, PaymentHotspots } from '../payments.js';

const PRIMEDOX_PLANS = [
  { label: 'INDIVIDUAL', priceLabel: '$49 CAD', paypalUrl: 'https://paypal.me/techpetcage/49CAD' },
  { label: 'TEAM', priceLabel: '$149 CAD', paypalUrl: 'https://paypal.me/techpetcage/149CAD' },
  { label: 'ENTERPRISE', priceLabel: '$499 CAD', paypalUrl: 'https://paypal.me/techpetcage/499CAD' },
];

function createDocumentPanel(THREE) {
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f4f4f8';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 3;
  ctx.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);
  ctx.fillStyle = '#1f2937';
  for (let y = 30; y < canvas.height - 20; y += 16) {
    ctx.fillRect(16, y, canvas.width - 32 - Math.random() * 40, 6);
  }
  const mat = new THREE.MeshBasicMaterial({
    map: new THREE.CanvasTexture(canvas),
    transparent: true,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 1), mat);
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

function createConveyorBelt(THREE) {
  const group = new THREE.Group();
  const belt = new THREE.Mesh(
    new THREE.BoxGeometry(2, 0.2, 14),
    new THREE.MeshStandardMaterial({ color: 0x1a1a2e, metalness: 0.6, roughness: 0.4 })
  );
  group.add(belt);

  const armBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.22, 1.4, 12),
    new THREE.MeshStandardMaterial({ color: 0x6d28d9, emissive: 0x2e1065, emissiveIntensity: 0.4, metalness: 0.8 })
  );
  armBase.position.set(1.4, 0.9, 0);
  group.add(armBase);

  const armHead = new THREE.Mesh(
    new THREE.ConeGeometry(0.18, 0.5, 8),
    new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xfbbf24, emissiveIntensity: 0.6 })
  );
  armHead.position.set(1.4, 1.7, 0);
  armHead.rotation.x = Math.PI;
  group.add(armHead);

  return { group, armHead, beltLength: 14 };
}

export function createPrimeDoxHQScene(THREE) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x050018, 5, 80);

  // CAMERA
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 6, 14);

  // LIGHTING
  const ambient = new THREE.AmbientLight(0x331144, 0.7);
  scene.add(ambient);

  const blue = new THREE.PointLight(0x3b82f6, 2, 60);
  blue.position.set(-6, 5, 6);
  scene.add(blue);

  const gold = new THREE.PointLight(0xfbbf24, 1.5, 60);
  gold.position.set(6, 5, 6);
  scene.add(gold);

  // FLOOR — HQ GRID
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.MeshStandardMaterial({
      color: 0x0b0015,
      metalness: 0.4,
      roughness: 0.2
    })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  // CENTRAL ROUTING CORE (AI HUB)
  const core = new THREE.Mesh(
    new THREE.TorusKnotGeometry(2, 0.6, 120, 16),
    new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x002233,
      metalness: 1,
      roughness: 0.1
    })
  );
  core.position.set(0, 4, 0);
  scene.add(core);

  // ROUTING PANELS (floating UI nodes)
  const panels = [];
  const panelGeo = new THREE.PlaneGeometry(3, 2);

  const panelData = [
    "LEGAL ROUTER",
    "CYBERSECURITY",
    "LUXURY AUTO",
    "PET TECH",
    "GENERAL CONCIERGE"
  ];

  panelData.forEach((label, i) => {
    const mat = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      transparent: true,
      opacity: 0.35
    });

    const panel = new THREE.Mesh(panelGeo, mat);
    panel.position.set(Math.cos(i) * 8, 3, Math.sin(i) * 8);
    panel.userData.label = label;

    scene.add(panel);
    panels.push(panel);
  });

  // PROCEDURAL AVATARS (NO ASSETS — GENERATED ENTITIES)

  function createAvatar(color, x, z) {
    const group = new THREE.Group();

    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 2),
      new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.2
      })
    );

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 16, 16),
      new THREE.MeshStandardMaterial({ color })
    );

    head.position.y = 1.5;

    group.add(body);
    group.add(head);

    group.position.set(x, 1, z);

    return group;
  }

  const avatars = [
    createAvatar(0x3b82f6, -4, 2), // legal
    createAvatar(0xf59e0b, 4, 2),  // finance
    createAvatar(0x10b981, -4, -3), // cyber
    createAvatar(0xec4899, 4, -3)   // concierge
  ];

  avatars.forEach(a => scene.add(a));

  // HOLOGRAPHIC ROUTING MAP (CENTER TABLE)
  const table = new THREE.Mesh(
    new THREE.CylinderGeometry(4, 4, 0.5, 32),
    new THREE.MeshStandardMaterial({
      color: 0x1f0036,
      emissive: 0x220044,
      metalness: 0.7,
      roughness: 0.2
    })
  );

  table.position.set(0, 1, 0);
  scene.add(table);

  // DOCUMENT ASSEMBLY LINE — conveyor belt + stamping robot arm, per SITE 3
  // spec ("robots building documents on conveyor belts, click to generate")
  const { group: conveyor, armHead, beltLength } = createConveyorBelt(THREE);
  conveyor.position.set(8, 0.6, 0);
  scene.add(conveyor);

  const documents = [];
  function spawnDocument(zOffset = 0) {
    const doc = createDocumentPanel(THREE);
    doc.position.set(8, 0.85, -beltLength / 2 + zOffset);
    scene.add(doc);
    documents.push(doc);
  }
  for (let i = 0; i < 4; i++) spawnDocument(i * 3.2);

  // PRICING BUY BUTTONS — Option A floating holographic buttons
  const hotspots = new PaymentHotspots(THREE, camera);
  PRIMEDOX_PLANS.forEach((plan, i) => {
    const mesh = createBuyButtonMesh(THREE, { ...plan, accentColor: '#00d4ff' });
    mesh.position.set(-3 + i * 3, 5, 9);
    scene.add(mesh);
    hotspots.add(mesh);
  });

  // CLICK-TO-GENERATE — clicking the conveyor belt spawns a new document
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  function onPointerDown(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObject(conveyor, true);
    if (hits.length) spawnDocument();
  }
  window.addEventListener('mousedown', onPointerDown);

  // SIMPLE ANIMATION LOOP
  function update() {
    const now = Date.now();
    core.rotation.y += 0.01;

    panels.forEach((p, i) => {
      p.material.opacity = 0.25 + Math.sin(now * 0.001 + i) * 0.1;
    });

    avatars.forEach((a, i) => {
      a.position.y = 1 + Math.sin(now * 0.001 + i) * 0.1;
    });

    armHead.position.y = 1.7 + Math.abs(Math.sin(now * 0.004)) * -0.3; // stamp motion

    for (let i = documents.length - 1; i >= 0; i--) {
      const doc = documents[i];
      doc.position.z += 0.025;
      if (doc.position.z > beltLength / 2) {
        scene.remove(doc);
        documents.splice(i, 1);
      }
    }

    hotspots.update();
  }

  function dispose() {
    window.removeEventListener('mousedown', onPointerDown);
    hotspots.dispose();
  }

  return {
    scene,
    camera,
    update,
    dispose,
  };
}
