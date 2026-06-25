/**
 * empire/fallbacks/AudioFallback.js
 *
 * Procedural ambience generator used whenever a floor's real audio file
 * fails to load. Builds a simple looping Tone.js synth voice from the
 * manifest's `audio.toneProfile` string so every floor gets a distinct
 * (if minimal) ambient soundscape with zero real audio assets.
 *
 * Requires Tone (Tone.js) to be passed in by the caller (AssetLoader).
 * Returns a handle with start()/stop()/dispose() rather than a raw buffer,
 * since procedural audio here is a live synth voice, not a sample.
 */

const PROFILES = {
  'grand-lobby': { note: 'C2', synth: 'AMSynth', filterFreq: 800, interval: '8n' },
  'industrial-hum': { note: 'D1', synth: 'FMSynth', filterFreq: 300, interval: '4n' },
  'library-quiet': { note: 'G3', synth: 'Synth', filterFreq: 1200, interval: '2n' },
  'soc-pulse': { note: 'A1', synth: 'MonoSynth', filterFreq: 500, interval: '16n' },
  'consulting-calm': { note: 'E3', synth: 'AMSynth', filterFreq: 1000, interval: '4n' },
  'lecture-hall': { note: 'C3', synth: 'Synth', filterFreq: 900, interval: '2n' },
  'ai-chime': { note: 'E5', synth: 'FMSynth', filterFreq: 2000, interval: '8n' },
  'garage-ambience': { note: 'F1', synth: 'FMSynth', filterFreq: 250, interval: '4n' },
  'soft-chime': { note: 'A4', synth: 'AMSynth', filterFreq: 1800, interval: '8n' },
  'wellness-pad': { note: 'D3', synth: 'AMSynth', filterFreq: 700, interval: '1n' },
  'observer-drone': { note: 'C1', synth: 'FMSynth', filterFreq: 400, interval: '1n' },
  'deep-space-drone': { note: 'G0', synth: 'FMSynth', filterFreq: 150, interval: '1n' },
  'quantum-shimmer': { note: 'B5', synth: 'FMSynth', filterFreq: 3000, interval: '16n' },
  'lab-hum': { note: 'E2', synth: 'MonoSynth', filterFreq: 600, interval: '8n' },
  'clinical-beep': { note: 'C6', synth: 'Synth', filterFreq: 2500, interval: '4n' },
  'trading-floor': { note: 'D4', synth: 'Synth', filterFreq: 1500, interval: '16n' },
  'turbine-hum': { note: 'A0', synth: 'FMSynth', filterFreq: 200, interval: '4n' },
  'warehouse-hum': { note: 'F2', synth: 'MonoSynth', filterFreq: 350, interval: '4n' },
  'silent': null,
  'phoenix-rise': { note: 'C4', synth: 'AMSynth', filterFreq: 2200, interval: '4n' },
};

const DEFAULT_PROFILE = { note: 'C3', synth: 'Synth', filterFreq: 800, interval: '4n' };

export function generateFallbackAudio(Tone, floor) {
  const key = floor.assets?.audio?.toneProfile || 'silent';
  const profile = PROFILES[key];

  if (!profile) {
    return {
      procedural: true,
      floor: floor.floor,
      slot: 'audio',
      silent: true,
      start() {},
      stop() {},
      dispose() {},
    };
  }

  const SynthCtor = Tone[profile.synth] || Tone.Synth;
  const filter = new Tone.Filter(profile.filterFreq, 'lowpass').toDestination();
  const synth = new SynthCtor().connect(filter);
  const volume = new Tone.Volume(-18).connect(filter);
  synth.connect(volume);

  let loop = null;

  return {
    procedural: true,
    floor: floor.floor,
    slot: 'audio',
    silent: false,
    start() {
      if (loop) return;
      loop = new Tone.Loop((time) => {
        synth.triggerAttackRelease(profile.note, '2n', time);
      }, profile.interval).start(0);
      if (Tone.Transport.state !== 'started') Tone.Transport.start();
    },
    stop() {
      if (loop) {
        loop.stop();
        loop.dispose();
        loop = null;
      }
    },
    dispose() {
      this.stop();
      synth.dispose();
      filter.dispose();
      volume.dispose();
    },
  };
}

export { PROFILES as AUDIO_PROFILES, DEFAULT_PROFILE };
