import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Use a relative base so index.html references assets relatively.
// This avoids issues when Vercel serves the app from a path or when
// absolute '/' asset paths cause 404s in some deployment setups.
export default defineConfig({
  base: './',
  plugins: [react()],
})
