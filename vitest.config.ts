import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  // Mirrors vite.config.ts's alias -- this config is standalone, so modules
  // under test that import '@/components/ui/...' (e.g. src/lib/styles.ts)
  // need it here too.
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, 'src') },
  },
  test: {
    environment: 'node',
    // .worktrees holds other in-progress branches checked out as full
    // copies of this repo (see superpowers:using-git-worktrees) -- since
    // the repo root and this project root are now the same directory,
    // Vitest's default discovery would otherwise pick up their test files
    // too, alongside vitest's own built-in node_modules/dist excludes.
    exclude: ['**/node_modules/**', '**/dist/**', '.worktrees/**'],
  },
})
