/**
 * empire/floors/floor4-omniguard.js
 *
 * Floor 4 — OmniGuard cybersecurity lobby scene (Three.js module).
 *
 * NOTE ON FLOOR NUMBER: this was handed off labeled "Floor 1," but
 * AssetManifest.js (already shipped on main) places OmniGuard at Floor 4 —
 * Floor 1 is Francisco Holdings Inc., the parent/lobby floor, per EMPIRE.md's
 * Holding Structure table. Filed under Floor 4 to match the shipped manifest;
 * flag to Derek if OmniGuard should actually be Floor 1 (would require
 * renumbering AssetManifest.js).
 *
 * Brand note: "OmniaGuard" was retired 2026-06-19 in favor of "OmniGuard"
 * (see CLAUDE.md brand enforcement table) — renamed accordingly. Neon point
 * light colors corrected to the brand-spec hex from CLAUDE.md
 * (blue #4A90E2 / pink #E91E63) — OmniGuard is the only brand permitted to
 * use blue or pink anywhere in the empire.
 *
 * Self-contained primitive-built scene (does not depend on
 * empire/AssetLoader.js) — returns { scene, camera, update } for a future
 * engine.js to mount and drive.
 *
 * PHASE 2 ADDITIONS (Derek's "BUILD PHASE 2 NOW" order): AI Core sphere now
 * pulses blue<->pink instead of static cyan; a 14-layer particle shield
 * surrounds the core (hover-glow / click-pulse via a raycaster against 14
 * invisible hit-spheres — added with window-level listeners, which is safe
 * because floor-registry.js's loadFloorScene() caches this module's factory
 * result and only ever calls createOmniGuardScene() once per page load, so
 * the listeners are never re-attached/duplicated on repeat floor visits);
 * the flat threat-map placeholder is replaced with a rotating wireframe
 * globe with surface "blips"; three canvas-texture holographic data panels
 * were added (procedural text, no external asset, same CanvasTexture
 * approach scene.js uses for the brushed-steel door normal map).
 *
 * COMBAT ADDITIONS (Derek's "BUILD FOUR 3D SITES" order, SITE 2 spec): a
 * robot squad patrols the floor, detects the three enemy types named in
 * that spec (ransomware blobs, prompt injection snakes, data broker gangs),
 * and destroys them with a laser-beam strike when in range; a clickable
 * "VPN CLOAK" panel temporarily drops the squad's opacity to simulate the
 * spec's invisibility effect. Pricing-tier buy buttons (paypal.me/techpetcage
 * amounts copied verbatim from stripe-config.js's omniguard block) use the
 * shared empire/payments.js Option A floating-button system.
 */

import { createBuyButtonMesh, PaymentHotspots } from '../payments.js';

const BLUE = { r: 0x4a, g: 0x90, b: 0xe2 };
const PINK = { r: 0xe9, g: 0x1e, b: 0x63 };
const SHIELD_LAYERS = 14;
const ROBOT_COUNT = 4;
const MAX_ENEMIES = 6;
const ENEMY_TYPES = ['ransomware', 'injection', 'databroker'];
const OMNIGUARD_PLANS = [
  { label: 'OMNIGUARD ENTRY', priceLabel: '$99 CAD', paypalUrl: 'https://paypal.me/techpetcage/99CAD' },
  { label: 'OMNIGUARD MID', priceLabel: '$299 CAD', paypalUrl: 'https://paypal.me/techpetcage/299CAD' },
  { label: 'OMNIGUARD PREMIUM', priceLabel: '$999 CAD', paypalUrl: 'https://paypal.me/techpetcage/999CAD' },
];

function lerpColorHex(c1, c2, t) {
  const r = Math.round(c1.r + (c2.r - c1.r) * t);
  const g = Math.round(c1.g + (c2.g - c1.g) * t);
  const b = Math.round(c1.b + (c2.b - c1.b) * t);
  return (r << 16) | (g << 8) | b;
}

// Fibonacci sphere sampling — even point distribution without trig-heavy jitter.
function fibonacciSpherePoint(i, n, radius) {
  const offset = 2 / n;
  const increment = Math.PI * (3 - Math.sqrt(5));
  const y = i * offset - 1 + offset / 2;
  const r = Math.sqrt(Math.max(0, 1 - y * y));
  const phi = i * increment;
  return {
    x: Math.cos(phi) * r * radius,
    y: y * radius,
    z: Math.sin(phi) * r * radius,
  };
}

function createShieldLayer(THREE, layerIndex) {
  const t = layerIndex / (SHIELD_LAYERS - 1);
  const radius = 2.2 + layerIndex * 0.35;
  const particleCount = 36 + layerIndex * 2;
  const color = lerpColorHex(BLUE, PINK, t);

  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const p = fibonacciSpherePoint(i, particleCount, radius);
    positions[i * 3] = p.x;
    positions[i * 3 + 1] = p.y + 3; // recenter on the threat core's height
    positions[i * 3 + 2] = p.z;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    color,
    size: 0.07,
    transparent: true,
    opacity: 0.35,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geo, mat);

  // Invisible hit-sphere: the actual raycast target for hover/click, since
  // raycasting against sparse Points is unreliable at typical camera distances.
  const hitGeo = new THREE.SphereGeometry(radius, 16, 12);
  const hitMat = new THREE.MeshBasicMaterial({ visible: false });
  const hitSphere = new THREE.Mesh(hitGeo, hitMat);
  hitSphere.position.set(0, 3, 0);
  hitSphere.userData.shieldLayerIndex = layerIndex;

  return { points, hitSphere, baseOpacity: 0.35, baseSize: 0.07, radius };
}

function createThreatGlobe(THREE) {
  const group = new THREE.Group();
  group.position.set(0, 2.5, -7);

  const wireGeo = new THREE.IcosahedronGeometry(2, 2);
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x4a90e2,
    wireframe: true,
    transparent: true,
    opacity: 0.35,
  });
  const wireGlobe = new THREE.Mesh(wireGeo, wireMat);
  group.add(wireGlobe);

  const blipGeo = new THREE.SphereGeometry(0.045, 8, 8);
  const blipCount = 30;
  for (let i = 0; i < blipCount; i++) {
    const isPink = i % 3 === 0;
    const blipMat = new THREE.MeshBasicMaterial({ color: isPink ? 0xe91e63 : 0x4a90e2 });
    const blip = new THREE.Mesh(blipGeo, blipMat);
    const p = fibonacciSpherePoint(i, blipCount, 2.02);
    blip.position.set(p.x, p.y, p.z);
    group.add(blip);
  }

  return { group, wireGlobe };
}

// Procedural canvas-texture "holographic" data panel — no external asset,
// same CanvasTexture technique scene.js uses for the brushed-steel normal map.
function createHoloPanel(THREE, title, value) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(5, 10, 20, 0.55)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#4A90E2';
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
  ctx.fillStyle = '#7db4ed';
  ctx.font = '28px monospace';
  ctx.fillText(title, 28, 64);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 56px monospace';
  ctx.fillText(value, 28, 150);
  ctx.fillStyle = '#E91E63';
  ctx.font = '20px monospace';
  ctx.fillText('OMNIGUARD AI SECURITY', 28, 210);

  const texture = new THREE.CanvasTexture(canvas);
  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0.88,
    side: THREE.DoubleSide,
  });
  const geo = new THREE.PlaneGeometry(2.6, 1.3);
  return new THREE.Mesh(geo, mat);
}

// Random spawn point on the combat floor, away from the camera's start.
function randomSpawnPoint() {
  const angle = Math.random() * Math.PI * 2;
  const radius = 6 + Math.random() * 9;
  return { x: Math.cos(angle) * radius, z: Math.sin(angle) * radius - 4 };
}

function createEnemy(THREE, type) {
  let mesh;
  if (type === 'ransomware') {
    mesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.5, 1),
      new THREE.MeshStandardMaterial({ color: 0xff3355, emissive: 0x550011, emissiveIntensity: 0.6, wireframe: false })
    );
  } else if (type === 'injection') {
    mesh = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.35, 0.12, 64, 8, 2, 3),
      new THREE.MeshStandardMaterial({ color: 0x84cc16, emissive: 0x223300, emissiveIntensity: 0.5 })
    );
  } else {
    mesh = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.28, 0.28),
        new THREE.MeshStandardMaterial({ color: 0x2a2a33, emissive: 0x111118, emissiveIntensity: 0.4 })
      );
      cube.position.set((Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.6);
      mesh.add(cube);
    }
  }
  const spawn = randomSpawnPoint();
  mesh.position.set(spawn.x, 1.4, spawn.z);
  mesh.userData.type = type;
  mesh.userData.alive = true;
  mesh.userData.dying = false;
  return mesh;
}

function createRobot(THREE, index) {
  const group = new THREE.Group();
  const accent = index % 2 === 0 ? 0x4a90e2 : 0xe91e63;

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.3, 0.7, 12),
    new THREE.MeshStandardMaterial({ color: 0xc8ccd4, metalness: 0.9, roughness: 0.25 })
  );
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 16, 16),
    new THREE.MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: 0.7 })
  );
  head.position.y = 0.55;
  group.add(body, head);
  group.position.y = 1.2;

  group.userData = {
    patrolAngle: (index / ROBOT_COUNT) * Math.PI * 2,
    patrolRadius: 10,
    state: 'patrol', // 'patrol' | 'engaging'
    target: null,
    laser: null,
    laserUntil: 0,
  };
  return group;
}

function createLaserBeam(THREE, color) {
  const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
  const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9 });
  const line = new THREE.Line(geo, mat);
  line.visible = false;
  return line;
}

export function createOmniGuardScene(THREE) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x05070d, 10, 60);

  // CAMERA SETUP
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 5, 12);

  // RENDERER LIGHTING BASE
  const ambient = new THREE.AmbientLight(0x1a2a3a, 0.8);
  scene.add(ambient);

  const neonBlue = new THREE.PointLight(0x4A90E2, 2, 50);
  neonBlue.position.set(-5, 4, 5);
  scene.add(neonBlue);

  const neonPink = new THREE.PointLight(0xE91E63, 2, 50);
  neonPink.position.set(5, 4, 5);
  scene.add(neonPink);

  // FLOOR PLANE (cyber grid base)
  const floorGeo = new THREE.PlaneGeometry(50, 50, 50, 50);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x0a0f1a,
    metalness: 0.6,
    roughness: 0.2,
    wireframe: false
  });

  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  // CENTRAL AI CORE (pulses blue <-> pink, per Phase 2 spec)
  const coreGeo = new THREE.IcosahedronGeometry(1.5, 2);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x4A90E2,
    emissive: 0x4A90E2,
    emissiveIntensity: 0.6,
    metalness: 1,
    roughness: 0.1
  });

  const threatCore = new THREE.Mesh(coreGeo, coreMat);
  threatCore.position.set(0, 3, 0);
  scene.add(threatCore);

  // SECURITY NODES (floating data points)
  const nodes = [];
  const nodeGeo = new THREE.SphereGeometry(0.2, 16, 16);

  for (let i = 0; i < 20; i++) {
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0xff3355,
      emissive: 0x220011
    });

    const node = new THREE.Mesh(nodeGeo, nodeMat);
    node.position.set(
      (Math.random() - 0.5) * 20,
      Math.random() * 5 + 1,
      (Math.random() - 0.5) * 20
    );

    scene.add(node);
    nodes.push(node);
  }

  // 14-LAYER PARTICLE SHIELD around the AI core, hover/click interactive.
  const shieldLayers = [];
  for (let i = 0; i < SHIELD_LAYERS; i++) {
    const layer = createShieldLayer(THREE, i);
    scene.add(layer.points, layer.hitSphere);
    shieldLayers.push(layer);
  }
  const glow = new Array(SHIELD_LAYERS).fill(0); // current glow strength per layer
  const pulseStart = new Array(SHIELD_LAYERS).fill(null);
  let hoveredLayer = -1;

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  function onPointerMove(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(shieldLayers.map((l) => l.hitSphere));
    hoveredLayer = hits.length ? hits[0].object.userData.shieldLayerIndex : -1;
  }

  function onPointerDown() {
    if (hoveredLayer >= 0) pulseStart[hoveredLayer] = performance.now();
  }

  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mousedown', onPointerDown);

  // HOLOGRAPHIC THREAT MAP -> rotating wireframe globe with blips
  const { group: threatGlobe, wireGlobe } = createThreatGlobe(THREE);
  scene.add(threatGlobe);

  // HOLOGRAPHIC DATA PANELS (procedural canvas readouts)
  const holoPanels = [
    createHoloPanel(THREE, 'THREATS BLOCKED', '14,392'),
    createHoloPanel(THREE, 'AGENTS ACTIVE', '14 / 14'),
    createHoloPanel(THREE, 'UPTIME', '99.98%'),
  ];
  holoPanels[0].position.set(-4.5, 4.2, -2);
  holoPanels[0].rotation.y = 0.4;
  holoPanels[1].position.set(4.5, 4.2, -2);
  holoPanels[1].rotation.y = -0.4;
  holoPanels[2].position.set(0, 6.4, -3.5);
  holoPanels.forEach((p) => scene.add(p));

  // ROBOT SQUAD + ENEMY COMBAT (Derek's SITE 2 spec: patrol, detect, destroy)
  const robots = [];
  for (let i = 0; i < ROBOT_COUNT; i++) {
    const robot = createRobot(THREE, i);
    const laser = createLaserBeam(THREE, i % 2 === 0 ? 0x4a90e2 : 0xe91e63);
    scene.add(robot, laser);
    robot.userData.laser = laser;
    robots.push(robot);
  }

  const enemies = [];
  for (let i = 0; i < MAX_ENEMIES; i++) {
    const enemy = createEnemy(THREE, ENEMY_TYPES[i % ENEMY_TYPES.length]);
    scene.add(enemy);
    enemies.push(enemy);
  }

  function respawnEnemy(enemy) {
    const type = ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];
    const fresh = createEnemy(THREE, type);
    scene.remove(enemy);
    scene.add(fresh);
    enemies[enemies.indexOf(enemy)] = fresh;
  }

  // VPN CLOAK — clickable holo panel, toggles squad invisibility for 5s
  const cloakPanel = createHoloPanel(THREE, 'VPN CLOAK', 'CLICK TO ENGAGE');
  cloakPanel.position.set(-7, 2.2, 4);
  scene.add(cloakPanel);
  let cloakUntil = 0;

  // PRICING BUY BUTTONS — Option A floating holographic buttons
  const hotspots = new PaymentHotspots(THREE, camera);
  OMNIGUARD_PLANS.forEach((plan, i) => {
    const mesh = createBuyButtonMesh(THREE, { ...plan, accentColor: i === 1 ? '#E91E63' : '#4A90E2' });
    mesh.position.set(-3 + i * 3, 1.6, 9);
    scene.add(mesh);
    hotspots.add(mesh);
  });

  function onCombatClick(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObject(cloakPanel);
    if (hits.length) cloakUntil = performance.now() + 5000;
  }
  window.addEventListener('mousedown', onCombatClick);

  // ANIMATION LOOP
  function update() {
    const now = Date.now();
    const corePulse = (Math.sin(now * 0.0012) + 1) / 2; // 0..1
    const coreColor = lerpColorHex(BLUE, PINK, corePulse);
    threatCore.material.color.setHex(coreColor);
    threatCore.material.emissive.setHex(coreColor);
    threatCore.rotation.y += 0.01;
    threatCore.rotation.x += 0.005;

    nodes.forEach((n, i) => {
      n.position.y += Math.sin(now * 0.001 + i) * 0.002;
    });

    shieldLayers.forEach((layer, i) => {
      const target = i === hoveredLayer ? 1 : 0;
      glow[i] += (target - glow[i]) * 0.12;

      let pulseScale = 1;
      if (pulseStart[i] != null) {
        const elapsed = (performance.now() - pulseStart[i]) / 600;
        if (elapsed >= 1) {
          pulseStart[i] = null;
        } else {
          pulseScale = 1 + Math.sin(elapsed * Math.PI) * 0.18;
        }
      }

      layer.points.material.opacity = layer.baseOpacity + glow[i] * 0.5;
      layer.points.material.size = layer.baseSize + glow[i] * 0.05;
      layer.points.scale.setScalar(pulseScale);
      layer.points.rotation.y += 0.0015 * (i % 2 === 0 ? 1 : -1);
      layer.hitSphere.rotation.copy(layer.points.rotation);
    });

    threatGlobe.rotation.y += 0.0025;
    wireGlobe.rotation.x += 0.0008;

    holoPanels.forEach((p, i) => {
      p.position.y += Math.sin(now * 0.0015 + i) * 0.0015;
    });

    // ROBOT PATROL / DETECT / DESTROY
    const cloaked = performance.now() < cloakUntil;
    robots.forEach((robot) => {
      const ud = robot.userData;
      if (ud.state === 'patrol') {
        ud.patrolAngle += 0.006;
        robot.position.x = Math.cos(ud.patrolAngle) * ud.patrolRadius;
        robot.position.z = Math.sin(ud.patrolAngle) * ud.patrolRadius - 4;
        robot.position.y = 1.2 + Math.sin(now * 0.003) * 0.05;

        const nearby = enemies.find((e) => e.userData.alive && !e.userData.dying && e.position.distanceTo(robot.position) < 4.5);
        if (nearby) {
          ud.state = 'engaging';
          ud.target = nearby;
        }
      } else if (ud.state === 'engaging' && ud.target) {
        const target = ud.target;
        if (!target.userData.alive) {
          ud.state = 'patrol';
          ud.target = null;
        } else {
          const dir = new THREE.Vector3().subVectors(target.position, robot.position);
          const dist = dir.length();
          if (dist > 0.6) {
            dir.normalize();
            robot.position.addScaledVector(dir, 0.05);
            robot.lookAt(target.position.x, robot.position.y, target.position.z);
          } else if (!target.userData.dying) {
            target.userData.dying = true;
            ud.laser.visible = true;
            ud.laser.geometry.setFromPoints([robot.position.clone(), target.position.clone()]);
            ud.laserUntil = now + 220;
            setTimeout(() => {
              target.userData.alive = false;
              respawnEnemy(target);
              ud.state = 'patrol';
              ud.target = null;
            }, 220);
          }
        }
      }

      if (ud.laser && now > ud.laserUntil) ud.laser.visible = false;

      robot.children.forEach((child) => {
        const mat = child.material;
        if (mat && 'opacity' in mat) {
          mat.transparent = true;
          mat.opacity += ((cloaked ? 0.15 : 1) - mat.opacity) * 0.15;
        }
      });
    });

    enemies.forEach((enemy, i) => {
      if (!enemy.userData.dying) {
        enemy.rotation.y += 0.02;
        enemy.position.y = 1.4 + Math.sin(now * 0.0018 + i) * 0.15;
      } else {
        enemy.scale.multiplyScalar(0.85);
      }
    });

    cloakPanel.rotation.y = cloaked ? Math.sin(now * 0.02) * 0.4 : 0;

    hotspots.update();
  }

  function dispose() {
    window.removeEventListener('mousemove', onPointerMove);
    window.removeEventListener('mousedown', onPointerDown);
    window.removeEventListener('mousedown', onCombatClick);
    hotspots.dispose();
  }

  return {
    scene,
    camera,
    update,
    dispose,
  };
}
