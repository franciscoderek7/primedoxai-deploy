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
 */

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

  // SIMPLE ANIMATION LOOP
  function update() {
    core.rotation.y += 0.01;

    panels.forEach((p, i) => {
      p.material.opacity = 0.25 + Math.sin(Date.now() * 0.001 + i) * 0.1;
    });

    avatars.forEach((a, i) => {
      a.position.y = 1 + Math.sin(Date.now() * 0.001 + i) * 0.1;
    });
  }

  return {
    scene,
    camera,
    update
  };
}
