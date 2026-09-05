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
        // Northern Blinds Brand Palette
        nb: {
          // Darks — Northern night, deep forest
          night:   '#0D1117',   // deep Canadian night sky
          forest:  '#1A2E20',   // northern forest
          bark:    '#2C1810',   // tree bark
          // Neutrals
          stone:   '#4A4540',   // northern stone
          driftwood: '#6B5E52', // driftwood
          mist:    '#B8B0A6',   // morning mist
          cloud:   '#DDD8D2',   // cloud
          snow:    '#F5F0EB',   // northern snow
          // Accents
          gold:    '#C9A055',   // northern autumn gold
          goldHover: '#D4AE6B',
          goldDeep: '#A07830',
          sage:    '#4D7C5E',   // lake/forest sage
          sageMid: '#6B9E7A',
          sageLight: '#95BFA4',
          // Functional
          accent:  '#C9A055',
          surface: '#F5F0EB',
          dark:    '#0D1117',
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
        'gradient-night': 'linear-gradient(135deg, #0D1117 0%, #1A2E20 50%, #0D1117 100%)',
        'gradient-snow': 'linear-gradient(135deg, #F5F0EB 0%, #E8E2D9 50%, #F5F0EB 100%)',
        'gradient-gold': 'linear-gradient(135deg, #C9A055 0%, #D4AE6B 50%, #A07830 100%)',
        'hero-overlay': 'linear-gradient(to bottom, rgba(13,17,23,0.3) 0%, rgba(13,17,23,0.6) 60%, rgba(13,17,23,0.92) 100%)',
        'section-fade': 'linear-gradient(to bottom, transparent, rgba(13,17,23,0.02))',
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
        'slide-in-right': 'slideInRight 0.5s ease-out forwards',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'shimmer':    'shimmer 2s infinite linear',
        'float':      'float 6s ease-in-out infinite',
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
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(201, 160, 85, 0.4)' },
          '50%':      { boxShadow: '0 0 0 12px rgba(201, 160, 85, 0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
      },
      boxShadow: {
        'gold':    '0 4px 32px rgba(201, 160, 85, 0.2)',
        'dark':    '0 4px 32px rgba(13, 17, 23, 0.5)',
        'card':    '0 2px 16px rgba(13, 17, 23, 0.08), 0 1px 4px rgba(13, 17, 23, 0.04)',
        'card-hover': '0 8px 48px rgba(13, 17, 23, 0.14), 0 2px 8px rgba(13, 17, 23, 0.08)',
        'glass':   '0 8px 32px rgba(13, 17, 23, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      transitionTimingFunction: {
        'ease-out-expo':  'cubic-bezier(0.16, 1, 0.3, 1)',
        'ease-in-expo':   'cubic-bezier(0.7, 0, 0.84, 0)',
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
