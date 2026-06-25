/**
 * empire/ConsoleReporter.js
 *
 * Subscribes to an AssetLoader's event bus and prints structured runtime
 * reports to the browser console — per-floor load summaries, a running
 * fallback-usage tally, and a final report. Purely observational: it never
 * touches the cache or load pipeline, only listens.
 */

export class ConsoleReporter {
  constructor(assetLoader, opts = {}) {
    this.loader = assetLoader;
    this.verbose = opts.verbose ?? false;
    this._unsubs = [];
    this._floorLog = new Map(); // floor.id -> { success: [], fallback: [], errors: [] }
  }

  attach() {
    const l = this.loader;

    this._unsubs.push(
      l.on('load:start', ({ floor, slot }) => {
        if (this.verbose) console.log(`%c[Floor ${floor.floor}] ${floor.name} — loading ${slot}...`, 'color:#888');
      })
    );

    this._unsubs.push(
      l.on('load:success', ({ floor, slot }) => {
        this._record(floor, 'success', slot);
        if (this.verbose) console.log(`%c[Floor ${floor.floor}] ${floor.name} — ${slot} loaded (real asset)`, 'color:#10b981');
      })
    );

    this._unsubs.push(
      l.on('load:fallback', ({ floor, slot }) => {
        this._record(floor, 'fallback', slot);
        console.warn(`[Floor ${floor.floor}] ${floor.name} — ${slot} missing, using procedural fallback`);
      })
    );

    this._unsubs.push(
      l.on('load:error', ({ floor, slot, error }) => {
        this._record(floor, 'errors', slot);
        console.error(`[Floor ${floor.floor}] ${floor.name} — ${slot} failed to load:`, error);
      })
    );

    this._unsubs.push(
      l.on('cache:hit', ({ floor, slot }) => {
        if (this.verbose) console.log(`%c[Floor ${floor.floor}] ${slot} served from cache`, 'color:#00d4ff');
      })
    );

    this._unsubs.push(
      l.on('floor:complete', ({ floor }) => {
        const log = this._floorLog.get(floor.id) || { success: [], fallback: [], errors: [] };
        const total = log.success.length + log.fallback.length + log.errors.length;
        console.log(
          `%c[Floor ${floor.floor}] ${floor.name} ready — ${log.success.length}/${total} real, ${log.fallback.length}/${total} procedural, ${log.errors.length} errors`,
          'color:#d4af37;font-weight:bold'
        );
      })
    );

    this._unsubs.push(
      l.on('elevator:requested', ({ floor }) => {
        if (this.verbose) console.log(`%c[Elevator] preloading floor ${floor}...`, 'color:#4A90E2');
      })
    );

    this._unsubs.push(
      l.on('elevator:arrived', ({ floor, previous }) => {
        console.log(`%c[Elevator] arrived at floor ${floor}${previous != null ? ` (from ${previous})` : ''}`, 'color:#4A90E2;font-weight:bold');
      })
    );

    return this;
  }

  _record(floor, bucket, slot) {
    if (!this._floorLog.has(floor.id)) this._floorLog.set(floor.id, { success: [], fallback: [], errors: [] });
    this._floorLog.get(floor.id)[bucket].push(slot);
  }

  /** Prints a full empire-wide summary table — call once after a bulk preload. */
  printSummary() {
    const stats = this.loader.getStats();
    const rows = Array.from(this._floorLog.entries()).map(([id, log]) => ({
      floor: id,
      real: log.success.length,
      procedural: log.fallback.length,
      errors: log.errors.length,
    }));

    console.group('%c🏢 Francisco Holdings Empire — Asset Report', 'font-size:14px;font-weight:bold;color:#d4af37');
    console.table(rows);
    console.log(
      `Totals — real assets: ${stats.loaded}, procedural fallbacks: ${stats.fallback}, cache hits: ${stats.cacheHits}, errors: ${stats.errors}, cache size: ${stats.cacheSize}`
    );
    if (stats.fallback > 0 && stats.loaded === 0) {
      console.warn('No real binary assets found anywhere — every slot on every floor is running on procedural fallbacks. This is expected until real textures/HDRIs/audio/models are added under empire assets base path.');
    }
    console.groupEnd();
  }

  dispose() {
    this._unsubs.forEach((unsub) => unsub());
    this._unsubs = [];
  }
}

export default ConsoleReporter;
