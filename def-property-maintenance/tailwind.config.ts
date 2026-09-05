import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        def: {
          // Darks — Muskoka slate palette
          night:    '#0D1421',   // deep night
          slate:    '#161C2D',   // Muskoka slate
          graphite: '#1F2638',   // graphite
          // Neutrals
          stone:    '#3A4060',   // northern stone
          smoke:    '#656B80',   // smoke
          mist:     '#9BA3B8',   // morning mist
          cloud:    '#CDD1DC',   // cloud
          snow:     '#F0F2F6',   // clean snow
          // Copper accent — premium, local, warm
          copper:   '#A87840',   // warm copper
          copperH:  '#BC8C50',   // copper hover
          copperD:  '#845F30',   // copper deep
          // Nature
          forest:   '#1A2E1C',   // northern forest
          pine:     '#2D4A32',   // pine
          sage:     '#4A7058',   // sage
          // Alert (security states only)
          alert:    '#C44B3B',
          alertBg:  '#2A1410',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Garamond', 'Georgia', 'serif'],
        body:    ['var(--font-body)', 'system-ui', 'sans-serif'],
        label:   ['var(--font-label)', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-mono)', 'monospace'],
      },
      fontSize: {
        'display-2xl': ['clamp(3rem, 8vw, 7rem)', { lineHeight: '1.0', letterSpacing: '-0.03em' }],
        'display-xl':  ['clamp(2.5rem, 6vw, 5rem)', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
        'display-lg':  ['clamp(2rem, 4vw, 3.5rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-md':  ['clamp(1.5rem, 3vw, 2.5rem)', { lineHeight: '1.15', letterSpacing: '-0.015em' }],
        'display-sm':  ['clamp(1.25rem, 2vw, 1.75rem)', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
      },
      backgroundImage: {
        'gradient-slate': 'linear-gradient(135deg, #0D1421 0%, #1A2030 50%, #0D1421 100%)',
        'gradient-snow':  'linear-gradient(135deg, #F0F2F6 0%, #E4E8F0 50%, #F0F2F6 100%)',
        'gradient-copper':'linear-gradient(135deg, #A87840 0%, #BC8C50 50%, #845F30 100%)',
        'hero-overlay':   'linear-gradient(to bottom, rgba(13,20,33,0.2) 0%, rgba(13,20,33,0.6) 60%, rgba(13,20,33,0.95) 100%)',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
        '120': '30rem',
        '160': '40rem',
      },
      animation: {
        'fade-up':    'fadeUp 0.7s ease-out forwards',
        'fade-in':    'fadeIn 0.5s ease-out forwards',
        'pulse-copper': 'pulseCopper 2s ease-in-out infinite',
        'shimmer':    'shimmer 2s infinite linear',
        'float':      'float 6s ease-in-out infinite',
        'scan-line':  'scanLine 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseCopper: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(168, 120, 64, 0.4)' },
          '50%':      { boxShadow: '0 0 0 12px rgba(168, 120, 64, 0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        scanLine: {
          '0%':   { transform: 'translateY(-100%)', opacity: '0' },
          '20%':  { opacity: '1' },
          '80%':  { opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
      },
      boxShadow: {
        'copper':    '0 4px 32px rgba(168, 120, 64, 0.25)',
        'dark':      '0 4px 32px rgba(13, 20, 33, 0.6)',
        'card':      '0 2px 16px rgba(13, 20, 33, 0.08), 0 1px 4px rgba(13, 20, 33, 0.04)',
        'card-hover':'0 8px 48px rgba(13, 20, 33, 0.14), 0 2px 8px rgba(13, 20, 33, 0.08)',
        'glass':     '0 8px 32px rgba(13, 20, 33, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      transitionTimingFunction: {
        'ease-out-expo':    'cubic-bezier(0.16, 1, 0.3, 1)',
        'ease-in-expo':     'cubic-bezier(0.7, 0, 0.84, 0)',
        'ease-in-out-expo': 'cubic-bezier(0.87, 0, 0.13, 1)',
      },
      screens: {
        'xs': '390px',
        '3xl': '1920px',
      },
    },
  },
  plugins: [],
};

export default config;
