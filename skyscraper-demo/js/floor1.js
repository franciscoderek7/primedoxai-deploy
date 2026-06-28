/**
 * skyscraper-demo/js/floor1.js
 *
 * Floor 1 — Francisco Holdings HQ template config. Pure data, no rendering
 * logic — consumed by engine.js's applyTemplate(config).
 */
export const Floor1CorporateHQ = {
  id: 'F1_HQ',
  floor: 1,
  name: 'Francisco Holdings HQ',
  domain: 'franciscoholdingsinc.com',

  theme: {
    background: '#0a0a0f',
    primary: '#FFD700',
    secondary: '#E5E4E2',
    accent: '#50C878',
  },

  lighting: {
    ambient: '#0A0A0A',
    bloom: true,
    intensity: 1.2,
  },

  materials: {
    floor: 'chrome_reflective',
    walls: 'holographic_glass',
    accents: 'gold_emissive',
  },

  particles: {
    type: 'gold_dust',
    count: 500,
    motion: 'slow_drift',
  },

  assets: {
    logo: '1418.jpg',
  },

  features: ['floating_logo', 'stats_panels', 'elevator_shaft', 'enter_button'],

  payments: {
    enabled: true,
    buttons: [
      { label: 'INVEST NOW', amount: 0, url: 'https://paypal.me/techpetcage', color: '#FFD700' },
    ],
  },
};

export default Floor1CorporateHQ;
