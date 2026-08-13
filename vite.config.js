import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// No `base` here on purpose. GitHub Pages serves a project site from /<repo>/,
// so the CI build passes `--base=/expense-tracker/` (see
// .github/workflows/deploy.yml) while local dev and preview stay at the root.
export default defineConfig({
  plugins: [react()],
})
