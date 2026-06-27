/**
 * engine/FloorInterface.js
 *
 * Contract every floor module's default-exported class must implement.
 * FloorManager only ever calls these three methods — it never reaches
 * into a floor's internals.
 */

export class FloorInterface {
  /**
   * Create the floor's content inside `container` using `data` fetched
   * from the backend. Must not assume any prior state exists.
   */
  async init(container, data) {
    throw new Error('FloorInterface.init() must be implemented');
  }

  /** Apply a fresh state snapshot to an already-mounted floor. */
  update(data) {
    throw new Error('FloorInterface.update() must be implemented');
  }

  /**
   * Tear down everything the floor created — cancel animation frames,
   * dispose Three.js geometries/materials/textures, dispose the renderer,
   * remove DOM nodes, remove event listeners. Must leave zero leaks.
   */
  destroy() {
    throw new Error('FloorInterface.destroy() must be implemented');
  }
}

export default FloorInterface;
