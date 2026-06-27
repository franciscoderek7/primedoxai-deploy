/**
 * floors/Floor2/Floor2Scene.js
 *
 * OmniGuard, wrapped into the FloorInterface contract. Renders the real
 * existing OmniGuard Three.js scene (empire/floors/floor4-omniguard.js's
 * createOmniGuardScene) rather than fabricated content — that module
 * already returns { scene, camera, update, dispose }; this file owns the
 * renderer, the render loop, and resize handling, and guarantees a
 * memory-safe destroy().
 *
 * Host page must provide a THREE import map (see
 * francisco-holdings-site/skyscraper-3d.html for the convention):
 *   <script type="importmap">
 *     { "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js" } }
 *   </script>
 */

import * as THREE from 'three';
import { createOmniGuardScene } from '../../empire/floors/floor4-omniguard.js';

export default class Floor2Scene {
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

    const built = createOmniGuardScene(THREE);
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
    // Backend-driven state hook. createOmniGuardScene's own update() drives
    // the visual pulse/rotation; this is where future live threat/node data
    // from data.payload would be applied once the backend sends real values.
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
