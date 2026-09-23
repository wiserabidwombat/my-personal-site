import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      // src/routes/routeMeta.ts (the shared SEO-metadata source of truth
      // for src/routes/*.tsx, see that file) and its routeMeta.test.ts live
      // inside src/routes/ so they sit right next to the route files they
      // back/test, matching this repo's "test next to the file it covers"
      // convention -- but neither exports a Route, so without this they'd
      // each print a "does not export a Route" warning on every build.
      routeFileIgnorePattern: '^routeMeta(\\.test)?\\.ts$',
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
})
