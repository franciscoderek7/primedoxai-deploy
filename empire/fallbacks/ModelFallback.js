/**
 * empire/fallbacks/ModelFallback.js
 *
 * Procedural geometry generator used whenever a floor's real .glb model
 * fails to load. Maps the manifest's `model.geometryHint` string to a
 * simple primitive-built THREE.Group so every floor still has *something*
 * standing on it with zero real model assets.
 *
 * Requires THREE to be passed in by the caller (AssetLoader).
 */

function box(THREE, w, h, d, color) {
  return new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color })
  );
}

function cylinder(THREE, rTop, rBottom, h, color) {
  return new THREE.Mesh(
    new THREE.CylinderGeometry(rTop, rBottom, h, 16),
    new THREE.MeshStandardMaterial({ color })
  );
}

const BUILDERS = {
  'reception-desk': (THREE, color) => {
    const g = new THREE.Group();
    const desk = box(THREE, 3, 1, 1, color);
    desk.position.y = 0.5;
    g.add(desk);
    return g;
  },
  desk: (THREE, color) => {
    const g = new THREE.Group();
    const top = box(THREE, 1.4, 0.08, 0.7, color);
    top.position.y = 0.75;
    g.add(top);
    const leg1 = box(THREE, 0.08, 0.75, 0.08, '#222222');
    leg1.position.set(-0.6, 0.375, -0.3);
    const leg2 = leg1.clone();
    leg2.position.x = 0.6;
    g.add(leg1, leg2);
    return g;
  },
  'cleaning-bot': (THREE, color) => cylinder(THREE, 0.3, 0.3, 0.15, color),
  bookshelf: (THREE, color) => box(THREE, 1.2, 2, 0.4, color),
  'server-rack': (THREE, color) => box(THREE, 0.6, 2, 0.8, color),
  'monitor-wall': (THREE, color) => box(THREE, 2.5, 1.4, 0.1, color),
  'meeting-table': (THREE, color) => cylinder(THREE, 1, 1, 0.75, color),
  podium: (THREE, color) => box(THREE, 0.8, 1.1, 0.6, color),
  terminal: (THREE, color) => box(THREE, 0.5, 0.4, 0.4, color),
  'concierge-desk': (THREE, color) => box(THREE, 2, 1.1, 0.8, color),
  'car-lift': (THREE, color) => box(THREE, 2.2, 0.2, 4.5, color),
  'smart-kennel': (THREE, color) => box(THREE, 0.8, 0.8, 0.9, color),
  'shipping-crate': (THREE, color) => box(THREE, 1, 1, 1, color),
  'lounge-chair': (THREE, color) => box(THREE, 0.8, 0.9, 0.8, color),
  'data-orb': (THREE, color) => new THREE.Mesh(new THREE.SphereGeometry(0.6, 24, 24), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.4 })),
  'satellite-model': (THREE, color) => box(THREE, 0.3, 0.3, 1.2, color),
  'autonomous-car': (THREE, color) => box(THREE, 1.8, 0.6, 4, color),
  'qubit-lattice': (THREE, color) => new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 0), new THREE.MeshStandardMaterial({ color, wireframe: true })),
  centrifuge: (THREE, color) => cylinder(THREE, 0.5, 0.5, 1, color),
  'exam-table': (THREE, color) => box(THREE, 1.8, 0.7, 0.7, color),
  'ticker-board': (THREE, color) => box(THREE, 2.5, 0.8, 0.1, color),
  'turbine-model': (THREE, color) => cylinder(THREE, 0.2, 0.4, 2.5, color),
  'pallet-rack': (THREE, color) => box(THREE, 2, 2.5, 1, color),
  'placeholder-block': (THREE, color) => box(THREE, 1, 1, 1, color),
  'phoenix-statue': (THREE, color) => new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.8, 8), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.6 })),
};

export function generateFallbackModel(THREE, floor) {
  const hint = floor.assets?.model?.geometryHint || 'placeholder-block';
  const builder = BUILDERS[hint] || BUILDERS['placeholder-block'];
  const mesh = builder(THREE, floor.themeColor || '#888888');
  mesh.userData = { ...(mesh.userData || {}), procedural: true, floor: floor.floor, slot: 'model', geometryHint: hint };
  return mesh;
}

export { BUILDERS as MODEL_BUILDERS };
