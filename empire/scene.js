/**
 * empire/scene.js
 *
 * The building shell: a generic lobby (with sliding elevator doors) plus an
 * elevator state machine that swaps the "active" {scene, camera, update}
 * triple between the lobby and whichever floor scene was requested, via
 * floor-registry.js. engine.js calls getActive() every frame and renders
 * whatever this returns — it has no knowledge of floors or transitions.
 */

import { loadFloorScene, getFloorLabel } from './floor-registry.js';

const DOOR_OPEN_OFFSET = 1.1;
const DOOR_HALF_TRANSITION_MS = 450;

function buildLobby(THREE) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000000, 5, 50);
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 4, 10);

  const ambient = new THREE.AmbientLight(0x404040, 0.6);
  scene.add(ambient);

  const gold = new THREE.PointLight(0xd4af37, 1.5, 40);
  gold.position.set(0, 6, 4);
  scene.add(gold);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30),
    new THREE.MeshStandardMaterial({ color: 0x0a0a0a, metalness: 0.5, roughness: 0.3 })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const doorMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.8, roughness: 0.2 });
  const doorGeo = new THREE.BoxGeometry(1.5, 4, 0.1);
  const doorLeft = new THREE.Mesh(doorGeo, doorMat);
  const doorRight = new THREE.Mesh(doorGeo, doorMat);
  doorLeft.position.set(-0.76, 2, -3);
  doorRight.position.set(0.76, 2, -3);
  scene.add(doorLeft, doorRight);

  function update() {
    gold.intensity = 1.3 + Math.sin(Date.now() * 0.0015) * 0.2;
  }

  return { scene, camera, update, doors: { left: doorLeft, right: doorRight } };
}

class EventBus {
  constructor() {
    this._listeners = new Map();
  }
  on(event, fn) {
    if (!this._listeners.has(event)) this._listeners.set(event, new Set());
    this._listeners.get(event).add(fn);
    return () => this._listeners.get(event)?.delete(fn);
  }
  emit(event, payload) {
    this._listeners.get(event)?.forEach((fn) => {
      try {
        fn(payload);
      } catch (err) {
        console.error(`[SkyscraperBuilding] listener for "${event}" threw:`, err);
      }
    });
  }
}

export class SkyscraperBuilding {
  constructor(THREE) {
    this.THREE = THREE;
    this.lobby = buildLobby(THREE);
    this.active = this.lobby;
    this.currentFloor = null;
    this.transitioning = false;
    this.events = new EventBus();
  }

  on(event, fn) {
    return this.events.on(event, fn);
  }

  getActive() {
    return this.active;
  }

  async _animateDoors(open) {
    const { left, right } = this.lobby.doors;
    return new Promise((resolve) => {
      const start = performance.now();
      const fromOffset = open ? 0 : DOOR_OPEN_OFFSET;
      const toOffset = open ? DOOR_OPEN_OFFSET : 0;
      const step = () => {
        const t = Math.min(1, (performance.now() - start) / DOOR_HALF_TRANSITION_MS);
        const offset = fromOffset + (toOffset - fromOffset) * t;
        left.position.x = -0.76 - offset;
        right.position.x = 0.76 + offset;
        if (t < 1) requestAnimationFrame(step);
        else resolve();
      };
      step();
    });
  }

  async goToFloor(floorNumber) {
    if (this.transitioning || floorNumber === this.currentFloor) return;

    this.transitioning = true;
    this.events.emit('elevator:doors-closing', { floor: floorNumber });
    this.active = this.lobby;
    await this._animateDoors(false);

    this.events.emit('elevator:loading', { floor: floorNumber, label: getFloorLabel(floorNumber) });

    let floorScene;
    try {
      floorScene = await loadFloorScene(floorNumber, this.THREE);
    } catch (err) {
      this.events.emit('elevator:error', { floor: floorNumber, error: err });
      await this._animateDoors(true);
      this.transitioning = false;
      return;
    }

    this.active = floorScene;
    this.currentFloor = floorNumber;
    this.events.emit('elevator:doors-opening', { floor: floorNumber, label: getFloorLabel(floorNumber) });
    await this._animateDoors(true);
    this.transitioning = false;
    this.events.emit('elevator:arrived', { floor: floorNumber, label: getFloorLabel(floorNumber) });
  }

  async returnToLobby() {
    if (this.transitioning || this.currentFloor === null) return;

    this.transitioning = true;
    this.events.emit('elevator:doors-closing', { floor: null });
    await this._animateDoors(false);

    this.active = this.lobby;
    this.currentFloor = null;
    this.events.emit('elevator:doors-opening', { floor: null, label: 'Lobby' });
    await this._animateDoors(true);
    this.transitioning = false;
    this.events.emit('elevator:arrived', { floor: null, label: 'Lobby' });
  }
}

export default SkyscraperBuilding;
