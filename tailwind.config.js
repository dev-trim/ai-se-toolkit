/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        sans:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ink: {
          DEFAULT: '#0C0C0C',
          2: '#141414',
          3: '#1C1C1C',
          4: '#252525',
          5: '#333333',
        },
        ivory: {
          DEFAULT: '#F0EBE1',
          dim:     '#9A9489',
          ghost:   '#4A4641',
        },
        acid: {
          DEFAULT: '#C8F550',
          dim:     'rgba(200,245,80,0.15)',
          glow:    'rgba(200,245,80,0.35)',
        },
        signal: {
          red:   '#FF3B30',
          amber: '#FF9F0A',
          green: '#30D158',
        },
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem', letterSpacing: '0.05em' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '88': '22rem',
        '100': '25rem',
        '120': '30rem',
      },
      borderRadius: {
        DEFAULT: '0',    /* Sharp by default */
        sm: '0',
        md: '0',
        lg: '0',
        xl: '0',
        '2xl': '0',
        '3xl': '0',
      },
      boxShadow: {
        'acid-sm': '0 0 12px rgba(200,245,80,0.3)',
        'acid':    '0 0 24px rgba(200,245,80,0.4)',
        'acid-lg': '0 0 40px rgba(200,245,80,0.5)',
        'lift':    '0 8px 32px rgba(0,0,0,0.6)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'spring':   'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      animation: {
        'reveal-up':    'reveal-up 0.55s cubic-bezier(0.22,1,0.36,1) both',
        'reveal-right': 'reveal-right 0.55s cubic-bezier(0.22,1,0.36,1) both',
        'reveal-fade':  'reveal-fade 0.45s ease both',
        'reveal-scale': 'reveal-scale 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'ticker':       'ticker 28s linear infinite',
        'spin-slow':    'spin-slow 0.8s linear infinite',
        'ping-dot':     'ping-dot 2s cubic-bezier(0,0,0.2,1) infinite',
        'acid-pulse':   'acid-pulse 3s ease-in-out infinite',
        'bar-breathe':  'bar-breathe 2s ease-in-out infinite',
      },
      keyframes: {
        'reveal-up': {
          from: { opacity: '0', transform: 'translateY(32px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'reveal-right': {
          from: { opacity: '0', transform: 'translateX(-24px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        'reveal-fade': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'reveal-scale': {
          from: { opacity: '0', transform: 'scale(0.96) translateY(12px)' },
          to:   { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        'ticker': {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
        'ping-dot': {
          '0%':        { transform: 'scale(1)', opacity: '0.8' },
          '80%,100%':  { transform: 'scale(2.5)', opacity: '0' },
        },
        'acid-pulse': {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(200,245,80,0.35)' },
          '50%':      { boxShadow: '0 0 24px 4px rgba(200,245,80,0.35)' },
        },
        'bar-breathe': {
          '0%,100%': { opacity: '0.25' },
          '50%':      { opacity: '0.65' },
        },
      },
    },
  },
  plugins: [],
}