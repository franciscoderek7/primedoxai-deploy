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
 */

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

  // CENTRAL THREAT CORE (holographic orb)
  const coreGeo = new THREE.IcosahedronGeometry(1.5, 2);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x00ffff,
    emissive: 0x003344,
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

  // HOLOGRAPHIC THREAT MAP (simple plane placeholder)
  const mapGeo = new THREE.PlaneGeometry(6, 4);
  const mapMat = new THREE.MeshBasicMaterial({
    color: 0x00ffcc,
    transparent: true,
    opacity: 0.3
  });

  const threatMap = new THREE.Mesh(mapGeo, mapMat);
  threatMap.position.set(0, 2, -6);
  scene.add(threatMap);

  // ANIMATION LOOP
  function update() {
    threatCore.rotation.y += 0.01;
    threatCore.rotation.x += 0.005;

    nodes.forEach((n, i) => {
      n.position.y += Math.sin(Date.now() * 0.001 + i) * 0.002;
    });
  }

  return {
    scene,
    camera,
    update
  };
}
