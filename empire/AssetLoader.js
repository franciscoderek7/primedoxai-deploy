/**
 * empire/AssetLoader.js
 *
 * Preloads, caches, and deduplicates the 5 asset slots (texture, hdri,
 * audio, model, shader) declared per-floor in AssetManifest.js. Falls back
 * to the procedural generators in empire/fallbacks/ whenever a real asset
 * file is missing or fails to load — which, today, is every floor, every
 * slot, since no binary assets exist in the repo yet.
 *
 * THREE and Tone are constructor-injected rather than imported directly so
 * this module has zero hard dependency on either library being installed —
 * the caller (a future Three.js scene) passes its own THREE/Tone instances.
 */

import { ASSET_BASE_PATH, getFloor, getAdjacentFloors } from './AssetManifest.js';
import {
  generateFallbackTexture,
  generateFallbackHDRI,
  generateFallbackAudio,
  generateFallbackModel,
  generateFallbackShader,
} from './fallbacks/index.js';

const SLOTS = ['texture', 'hdri', 'audio', 'model', 'shader'];

class EventBus {
  constructor() {
    this._listeners = new Map();
  }
  on(event, fn) {
    if (!this._listeners.has(event)) this._listeners.set(event, new Set());
    this._listeners.get(event).add(fn);
    return () => this.off(event, fn);
  }
  off(event, fn) {
    this._listeners.get(event)?.delete(fn);
  }
  emit(event, payload) {
    this._listeners.get(event)?.forEach((fn) => {
      try {
        fn(payload);
      } catch (err) {
        // a listener throwing must never break the loader pipeline
        console.error(`[AssetLoader] listener for "${event}" threw:`, err);
      }
    });
  }
}

export class AssetLoader {
  constructor({ THREE = null, Tone = null, basePath = ASSET_BASE_PATH } = {}) {
    this.THREE = THREE;
    this.Tone = Tone;
    this.basePath = basePath;
    this.cache = new Map(); // key: `${floorId}:${slot}` -> resolved asset
    this.pending = new Map(); // key -> in-flight Promise (dedupe)
    this.events = new EventBus();
    this.stats = { loaded: 0, fallback: 0, cacheHits: 0, errors: 0 };
  }

  on(event, fn) {
    return this.events.on(event, fn);
  }

  _key(floor, slot) {
    return `${floor.id}:${slot}`;
  }

  async _loadTexture(floor) {
    if (!this.THREE) {
      return { asset: { procedural: true, floor: floor.floor, slot: 'texture', stub: true }, procedural: true };
    }
    const url = this.basePath + floor.assets.texture.path;
    try {
      return await new Promise((resolve, reject) => {
        const loader = new this.THREE.TextureLoader();
        loader.load(
          url,
          (tex) => resolve({ asset: tex, procedural: false }),
          undefined,
          (err) => reject(err)
        );
      });
    } catch {
      return { asset: generateFallbackTexture(this.THREE, floor), procedural: true };
    }
  }

  async _loadHDRI(floor) {
    if (!this.THREE) {
      return { asset: { procedural: true, floor: floor.floor, slot: 'hdri', stub: true }, procedural: true };
    }
    const RGBELoaderCtor = this.THREE.RGBELoader;
    if (!RGBELoaderCtor) {
      return { asset: generateFallbackHDRI(this.THREE, floor), procedural: true };
    }
    const url = this.basePath + floor.assets.hdri.path;
    try {
      return await new Promise((resolve, reject) => {
        const loader = new RGBELoaderCtor();
        loader.load(
          url,
          (tex) => resolve({ asset: tex, procedural: false }),
          undefined,
          (err) => reject(err)
        );
      });
    } catch {
      return { asset: generateFallbackHDRI(this.THREE, floor), procedural: true };
    }
  }

  async _loadAudio(floor) {
    const url = this.basePath + floor.assets.audio.path;
    if (!this.Tone) {
      return { asset: { procedural: true, silent: true, start() {}, stop() {}, dispose() {} }, procedural: true };
    }
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const player = new this.Tone.Player(url).toDestination();
      return { asset: player, procedural: false };
    } catch {
      return { asset: generateFallbackAudio(this.Tone, floor), procedural: true };
    }
  }

  async _loadModel(floor) {
    if (!this.THREE) {
      return { asset: { procedural: true, floor: floor.floor, slot: 'model', stub: true }, procedural: true };
    }
    const GLTFLoaderCtor = this.THREE.GLTFLoader;
    if (!GLTFLoaderCtor) {
      return { asset: generateFallbackModel(this.THREE, floor), procedural: true };
    }
    const url = this.basePath + floor.assets.model.path;
    try {
      return await new Promise((resolve, reject) => {
        const loader = new GLTFLoaderCtor();
        loader.load(
          url,
          (gltf) => resolve({ asset: gltf.scene, procedural: false }),
          undefined,
          (err) => reject(err)
        );
      });
    } catch {
      return { asset: generateFallbackModel(this.THREE, floor), procedural: true };
    }
  }

  async _loadShader(floor) {
    // No custom ShaderMaterial registry exists yet — always fall back today.
    if (!this.THREE) {
      return { asset: { procedural: true, floor: floor.floor, slot: 'shader', stub: true }, procedural: true };
    }
    return { asset: generateFallbackShader(this.THREE, floor), procedural: true };
  }

  async loadSlot(floorOrId, slot) {
    const floor = typeof floorOrId === 'object' ? floorOrId : getFloor(floorOrId);
    if (!floor) throw new Error(`AssetLoader: unknown floor "${floorOrId}"`);
    if (!SLOTS.includes(slot)) throw new Error(`AssetLoader: unknown slot "${slot}"`);

    const key = this._key(floor, slot);

    if (this.cache.has(key)) {
      this.stats.cacheHits++;
      this.events.emit('cache:hit', { floor, slot, key });
      return this.cache.get(key);
    }

    if (this.pending.has(key)) {
      return this.pending.get(key);
    }

    this.events.emit('load:start', { floor, slot, key });

    const loaderFn = {
      texture: () => this._loadTexture(floor),
      hdri: () => this._loadHDRI(floor),
      audio: () => this._loadAudio(floor),
      model: () => this._loadModel(floor),
      shader: () => this._loadShader(floor),
    }[slot];

    const promise = loaderFn()
      .then((result) => {
        this.cache.set(key, result);
        this.pending.delete(key);
        if (result.procedural) {
          this.stats.fallback++;
          this.events.emit('load:fallback', { floor, slot, key });
        } else {
          this.stats.loaded++;
          this.events.emit('load:success', { floor, slot, key });
        }
        return result;
      })
      .catch((err) => {
        this.pending.delete(key);
        this.stats.errors++;
        this.events.emit('load:error', { floor, slot, key, error: err });
        throw err;
      });

    this.pending.set(key, promise);
    return promise;
  }

  async loadFloor(floorOrId) {
    const floor = typeof floorOrId === 'object' ? floorOrId : getFloor(floorOrId);
    if (!floor) throw new Error(`AssetLoader: unknown floor "${floorOrId}"`);
    const results = await Promise.all(SLOTS.map((slot) => this.loadSlot(floor, slot)));
    const byslot = {};
    SLOTS.forEach((slot, i) => (byslot[slot] = results[i]));
    this.events.emit('floor:complete', { floor, assets: byslot });
    return byslot;
  }

  async preloadFloors(floors) {
    return Promise.all(floors.map((f) => this.loadFloor(f)));
  }

  async preloadAroundFloor(floorNumber, radius = 1) {
    const center = getFloor(floorNumber);
    if (!center) return [];
    const neighbors = getAdjacentFloors(floorNumber, radius);
    return this.preloadFloors([center, ...neighbors]);
  }

  clearCache() {
    this.cache.clear();
  }

  getStats() {
    return { ...this.stats, cacheSize: this.cache.size, pending: this.pending.size };
  }
}

export default AssetLoader;
