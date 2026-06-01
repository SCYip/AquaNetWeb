import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // For Netlify deployment: site is served from root, so base should be "/"
  // If deploying to a subdirectory (e.g. /aquanet/), change this accordingly
  base: '/',
  // Pre-bundle GSAP + plugins at startup so Vite's dep optimizer doesn't
  // discover the subpath plugins late (which caused 504 "outdated optimize dep"
  // reload loops in dev). The plugin subpaths must be listed explicitly.
  optimizeDeps: {
    include: ['gsap', 'gsap/ScrollTrigger', 'gsap/SplitText', '@gsap/react'],
  },
})
