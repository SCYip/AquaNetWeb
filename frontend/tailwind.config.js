/** @type {import('tailwindcss').Config}
 *
 * AquaNet 水眸 — Design tokens
 *
 * Hard rules (modelled after WIRED + Apple):
 *   - Only 4 colours.
 *   - Display = Fraunces 400. Body = IBM Plex Serif. Meta = IBM Plex Mono.
 *   - Italics only on Latin words.
 *   - Border-radius is 0 or 9999, never in between.
 *   - No shadows. No gradient veils. No opacity-based "secondary" text.
 */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#ffffff',   // page background
        ink:    '#1a1a1a',   // primary text + buttons + footer band
        mute:   '#6e6e73',   // secondary text — defined gray, not opacity
        line:   '#d2d2d7',   // hairlines
        link:   '#0a4d8c',   // single accent — links, focus rings, the rare CTA highlight
      },
      fontFamily: {
        display: ['Fraunces', '"IBM Plex Serif"', 'Georgia', 'serif'],
        body:    ['"IBM Plex Serif"', '"Source Han Serif SC"', '"Noto Serif SC"', 'Georgia', 'serif'],
        meta:    ['"IBM Plex Mono"', 'ui-monospace', 'Menlo', 'monospace'],
      },
      fontSize: {
        // Tight, magazine-scaled type system
        'hero':    ['clamp(2.75rem, 6.5vw, 5.5rem)', { lineHeight: '1.02', letterSpacing: '-0.018em' }],
        'display': ['clamp(2rem, 4vw, 3.25rem)',     { lineHeight: '1.08', letterSpacing: '-0.012em' }],
        'subhead': ['1.5rem',                         { lineHeight: '1.2',  letterSpacing: '-0.01em' }],
        'lede':    ['1.25rem',                        { lineHeight: '1.55' }],
        'body':    ['1.0625rem',                      { lineHeight: '1.55' }],
        'small':   ['0.9375rem',                      { lineHeight: '1.5' }],
        'meta':    ['0.75rem',                        { lineHeight: '1.3', letterSpacing: '0.06em' }],
      },
      borderRadius: {
        none: '0px',
        full: '9999px',
      },
    },
  },
  plugins: [],
}
