/**
 * skyscraper-demo/js/floor2.js
 *
 * Floor 2 — OmniGuard Cyber Defense template config. Pure data, no
 * rendering logic — consumed by engine.js's applyTemplate(config).
 */
export const Floor2OmniGuard = {
  id: 'F2_OMNIGUARD',
  floor: 2,
  name: 'OmniGuard Cyber Defense',
  domain: 'omniaguard.com',

  theme: {
    background: '#000011',
    primary: '#00BFFF',
    secondary: '#FF1493',
    accent: '#C0C0C0',
  },

  lighting: {
    ambient: '#000011',
    bloom: true,
    intensity: 1.5,
  },

  materials: {
    floor: 'chrome_reflective',
    walls: 'holographic_glass',
    accents: 'blue_emissive',
  },

  particles: {
    type: 'starfield',
    count: 1000,
    motion: 'slow_drift',
  },

  assets: {
    logo: '1000006509.jpg',
    robots: ['350.jpg', '349.jpg', '342.png'],
  },

  features: ['floating_logo', 'robot_squad', 'threat_counter', 'combat_demo', 'vpn_cloak'],

  payments: {
    enabled: true,
    buttons: [
      { label: 'WARDEN', amount: 299, url: 'https://paypal.me/techpetcage/299', color: '#00BFFF' },
      { label: 'SENTINEL', amount: 599, url: 'https://paypal.me/techpetcage/599', color: '#FF1493' },
      { label: 'ORACLE', amount: 999, url: 'https://paypal.me/techpetcage/999', color: '#C0C0C0' },
    ],
  },
};

export default Floor2OmniGuard;
