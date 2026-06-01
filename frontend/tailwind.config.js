/** @type {import('tailwindcss').Config}
 *
 * AquaNet 水眸 — Instrument Console design tokens
 *
 * Hard rules:
 *   - Display = Bricolage Grotesque (variable). Body & meta = IBM Plex Mono. CJK = Noto Serif SC.
 *   - Bone canvas, not pure white. Ink is warm-near-black.
 *   - One signal accent (orange) — used only for LIVE state and primary CTAs.
 *   - Corner radius: 0, 4, 8, 12, or 9999. Never in between.
 *   - No gratuitous shadows. Use 1px hairlines for separation.
 */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#fafaf7',   // bone — slight warmth, not pure white
        ink:    '#0a0a0a',   // warm near-black
        mute:   '#6e6e73',   // defined gray
        line:   '#d2d2d7',   // hairlines
        signal: '#ff5a1f',   // the one accent — LIVE state, primary CTAs
        link:   '#0a4d8c',   // text links + focus rings
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', '"IBM Plex Mono"', 'ui-monospace', 'sans-serif'],
        mono:    ['"IBM Plex Mono"', 'ui-monospace', 'Menlo', 'monospace'],
        zh:      ['"Noto Serif SC"', '"Source Han Serif SC"', 'Georgia', 'serif'],
      },
      fontSize: {
        // Instrument-scaled type
        'hero':    ['clamp(3rem, 7.5vw, 6.5rem)',  { lineHeight: '0.96', letterSpacing: '-0.025em' }],
        'display': ['clamp(2rem, 4.5vw, 3.75rem)', { lineHeight: '1.02', letterSpacing: '-0.018em' }],
        'subhead': ['clamp(1.25rem, 2vw, 1.625rem)', { lineHeight: '1.18', letterSpacing: '-0.01em' }],
        'lede':    ['1.1875rem',                   { lineHeight: '1.6' }],
        'body':    ['1rem',                        { lineHeight: '1.6' }],
        'small':   ['0.875rem',                    { lineHeight: '1.5' }],
        'meta':    ['0.6875rem',                   { lineHeight: '1.3', letterSpacing: '0.1em' }],
        'micro':   ['0.625rem',                    { lineHeight: '1.3', letterSpacing: '0.14em' }],
      },
      borderRadius: {
        none: '0px',
        sm:   '4px',
        md:   '8px',
        lg:   '12px',
        full: '9999px',
      },
      letterSpacing: {
        'tightest': '-0.025em',
        'wider-mono': '0.1em',
        'widest-mono': '0.16em',
      },
      animation: {
        'pulse-signal': 'pulse-signal 1.6s ease-in-out infinite',
        'tick-in': 'tick-in 800ms cubic-bezier(0.16, 1, 0.3, 1) both',
      },
      keyframes: {
        'pulse-signal': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '0.4', transform: 'scale(0.85)' },
        },
        'tick-in': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
