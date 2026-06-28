/**
 * floors/Floor3/Floor3Scene.js
 *
 * PrimeDox AI, wrapped into the FloorInterface contract. Renders the real
 * existing Three.js scene (empire/floors/floor9-primedox-ai.js's
 * createPrimeDoxHQScene — filed under manifest Floor 9, mounted here as
 * Floor 3 since both the AssetManifest numbering and Derek's numbering
 * agree PrimeDox AI is Floor 3 in this floors/Floor1-10 system) rather
 * than a DOM placeholder — same adapter pattern as Floor2Scene.js.
 */
import * as THREE from 'three';
import { createPrimeDoxHQScene } from '../../empire/floors/floor9-primedox-ai.js';

export default class Floor3Scene {
  constructor() {
    this.container = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.sceneUpdate = null;
    this.sceneDispose = null;
    this.frameId = null;
    this._onResize = this._onResize.bind(this);
  }

  async init(container, data = {}) {
    this.container = container;

    const built = createPrimeDoxHQScene(THREE);
    this.scene = built.scene;
    this.camera = built.camera;
    this.sceneUpdate = built.update;
    this.sceneDispose = built.dispose ?? null;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    window.addEventListener('resize', this._onResize);

    this._running = true;
    const loop = () => {
      if (!this._running) return;
      this.frameId = requestAnimationFrame(loop);
      this.sceneUpdate?.();
      this.renderer.render(this.scene, this.camera);
    };
    loop();

    this.update(data);
  }

  update(data = {}) {
    // Backend-driven state hook — no live fields consumed yet.
  }

  _onResize() {
    if (!this.container || !this.camera?.isPerspectiveCamera) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  destroy() {
    this._running = false;
    if (this.frameId != null) cancelAnimationFrame(this.frameId);
    this.frameId = null;

    window.removeEventListener('resize', this._onResize);
    this.sceneDispose?.();

    if (this.scene) {
      this.scene.traverse((obj) => {
        obj.geometry?.dispose?.();
        if (obj.material) {
          const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
          materials.forEach((mat) => {
            mat.map?.dispose?.();
            mat.dispose?.();
          });
        }
      });
    }

    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.container = null;
  }
}
