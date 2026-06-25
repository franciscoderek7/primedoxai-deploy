/**
 * empire/index.js
 *
 * Convenience barrel for the Asset Manifest System. A future Three.js scene
 * wires this up roughly like:
 *
 *   import * as THREE from 'three';
 *   import * as Tone from 'tone';
 *   import { AssetLoader, ElevatorPreload, ConsoleReporter, FLOORS } from './empire/index.js';
 *
 *   const loader = new AssetLoader({ THREE, Tone });
 *   const reporter = new ConsoleReporter(loader, { verbose: false }).attach();
 *   const elevator = new ElevatorPreload(loader);
 *
 *   await elevator.onFloorRequested(9);   // preloads floor 9 + neighbors
 *   await elevator.onFloorArrived(9);     // doors open, floor 9 guaranteed loaded
 *   reporter.printSummary();
 *
 * No such scene exists in this repo yet — this module has nothing to render
 * into. It is foundational plumbing for whenever that scene gets built.
 */

export { FLOORS, TOTAL_FLOORS, ASSET_BASE_PATH, getFloor, getFloorById, getAdjacentFloors, getVisibleFloors } from './AssetManifest.js';
export { AssetLoader } from './AssetLoader.js';
export { ElevatorPreload } from './ElevatorPreload.js';
export { ConsoleReporter } from './ConsoleReporter.js';
export * from './fallbacks/index.js';
