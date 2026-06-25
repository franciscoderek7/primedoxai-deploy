/**
 * empire/ElevatorPreload.js
 *
 * Hooks an AssetLoader up to elevator movement so the skyscraper can
 * preload a floor's assets *before* the elevator doors open on it. There is
 * no elevator UI/controller anywhere in the repo yet — this is the
 * integration point a future elevator controller is expected to call into
 * (`onFloorRequested` / `onFloorArrived`), not a standalone feature.
 */

import { getFloor, TOTAL_FLOORS } from './AssetManifest.js';

export class ElevatorPreload {
  /**
   * @param {import('./AssetLoader.js').AssetLoader} assetLoader
   * @param {{ preloadRadius?: number }} [opts]
   */
  constructor(assetLoader, opts = {}) {
    this.loader = assetLoader;
    this.preloadRadius = opts.preloadRadius ?? 1;
    this.currentFloor = null;
    this.targetFloor = null;
  }

  /**
   * Call the moment a rider selects a destination floor — kicks off preload
   * for the destination and its neighbors immediately, before the elevator
   * physically arrives, so assets are warm by the time doors open.
   */
  async onFloorRequested(floorNumber) {
    if (floorNumber < 1 || floorNumber > TOTAL_FLOORS) {
      throw new RangeError(`ElevatorPreload: floor ${floorNumber} out of range (1-${TOTAL_FLOORS})`);
    }
    this.targetFloor = floorNumber;
    this.loader.events.emit('elevator:requested', { floor: floorNumber });
    await this.loader.preloadAroundFloor(floorNumber, this.preloadRadius);
    this.loader.events.emit('elevator:preload-complete', { floor: floorNumber });
  }

  /**
   * Call the moment the elevator doors actually open on a floor — finalizes
   * the "current floor" pointer and kicks off a second-ring preload so
   * adjacent floors stay warm if the rider keeps moving in the same
   * direction.
   */
  async onFloorArrived(floorNumber) {
    const previous = this.currentFloor;
    this.currentFloor = floorNumber;
    this.targetFloor = null;
    this.loader.events.emit('elevator:arrived', { floor: floorNumber, previous });

    const floor = getFloor(floorNumber);
    if (!floor) return;

    // Already-warm assets resolve instantly from cache; this just ensures
    // the floor we landed on is fully loaded even if it wasn't preloaded
    // (e.g. a direct jump via floor-select panel skipping the request hook).
    await this.loader.loadFloor(floor);

    // Keep moving in the same direction warm.
    if (previous != null) {
      const direction = floorNumber > previous ? 1 : -1;
      const nextAhead = floorNumber + direction * this.preloadRadius;
      const aheadFloor = getFloor(nextAhead);
      if (aheadFloor) this.loader.loadFloor(aheadFloor).catch(() => {});
    }
  }

  getCurrentFloor() {
    return this.currentFloor;
  }
}

export default ElevatorPreload;
