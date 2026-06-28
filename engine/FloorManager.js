/**
 * engine/FloorManager.js
 *
 * Owns exactly one mounted floor at a time. mountFloor() always runs in
 * this fixed order: destroy old -> fetch state -> init new. Floors are
 * resolved only through FloorRegistry — no ad hoc imports here.
 */

import { getFloorLoader, getRegisteredFloorIds } from './FloorRegistry.js';

const DEFAULT_API_BASE = '/api';

export class FloorManager {
  /**
   * @param {HTMLElement} root - element each floor's container is mounted into
   * @param {{ apiBase?: string }} [opts]
   */
  constructor(root, opts = {}) {
    if (!root) throw new Error('FloorManager: root element is required');
    this.root = root;
    this.apiBase = opts.apiBase ?? DEFAULT_API_BASE;
    this.activeFloorId = null;
    this.activeInstance = null;
    this.activeContainer = null;
    this._mounting = false;
  }

  getCurrentFloor() {
    return this.activeFloorId;
  }

  /**
   * Falls back to {} when the backend is unreachable or returns non-OK,
   * so floors still mount and render in environments with no live API
   * (e.g. static hosting, local file testing) — floors only use this for
   * optional live-data hooks, never for initial render.
   */
  async fetchFloorState(floorId) {
    try {
      const res = await fetch(`${this.apiBase}/floors/${floorId}/state`);
      if (!res.ok) throw new Error(`status ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`FloorManager: state fetch failed for floor ${floorId} (${err.message}) — mounting with {}`);
      return {};
    }
  }

  /**
   * destroy old -> fetch state -> init new. Always leaves exactly one
   * active floor (or none, if this is the very first mount and it throws
   * before init completes).
   */
  async mountFloor(floorId) {
    if (this._mounting) {
      throw new Error('FloorManager: mountFloor() called while another mount is in progress');
    }
    if (floorId === this.activeFloorId) return this.activeInstance;

    const FloorClass = getFloorLoader(floorId);
    if (!FloorClass) {
      throw new Error(`FloorManager: floor ${floorId} is not registered`);
    }

    this._mounting = true;
    try {
      // 1. destroy old
      await this._destroyActive();

      // 2. fetch state
      const data = await this.fetchFloorState(floorId);

      // 3. init new
      const container = document.createElement('div');
      container.className = 'floor-container';
      container.dataset.floorId = String(floorId);
      container.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;';
      this.root.appendChild(container);

      const instance = new FloorClass();
      await instance.init(container, data);

      this.activeFloorId = floorId;
      this.activeInstance = instance;
      this.activeContainer = container;

      return instance;
    } finally {
      this._mounting = false;
    }
  }

  /** Push a fresh state snapshot into whichever floor is currently mounted. */
  async refreshActive() {
    if (this.activeFloorId == null || !this.activeInstance) return;
    const data = await this.fetchFloorState(this.activeFloorId);
    this.activeInstance.update(data);
  }

  async unmountActive() {
    await this._destroyActive();
  }

  async _destroyActive() {
    if (!this.activeInstance) return;
    await this.activeInstance.destroy();
    if (this.activeContainer?.parentNode) {
      this.activeContainer.parentNode.removeChild(this.activeContainer);
    }
    this.activeFloorId = null;
    this.activeInstance = null;
    this.activeContainer = null;
  }
}

export { getRegisteredFloorIds };
export default FloorManager;
