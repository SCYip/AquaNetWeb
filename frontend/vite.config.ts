import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // For Netlify deployment: site is served from root, so base should be "/"
  // If deploying to a subdirectory (e.g. /aquanet/), change this accordingly
  base: '/',
})
