import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // .worktrees holds other in-progress branches checked out as full copies
  // of this repo (see superpowers:using-git-worktrees) -- since the repo
  // root and this project root are now the same directory, ESLint's
  // default file discovery would otherwise lint their files too.
  globalIgnores(['dist', '.worktrees']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // TanStack Router route files export `Route` next to their component
      // (TanStack's recommended setting). allowConstantExport matches the
      // vite preset above.
      'react-refresh/only-export-components': ['error', { allowConstantExport: true, allowExportNames: ['Route'] }],
    },
  },
  {
    // TanStack Router route files define their component locally and export
    // only `Route`. allowExportNames above doesn't cover that: this plugin
    // version still reports a file's unexported components when it exports
    // no component. Exporting the components would stop the router plugin
    // code-splitting them (autoCodeSplitting in vite.config.ts), and the
    // router plugin handles HMR for route files itself.
    files: ['src/routes/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    // Generated shadcn/ui code exports helpers (buttonVariants,
    // badgeVariants, navigationMenuTriggerStyle, useCarousel) next to its
    // components. Leaving it as generated keeps future `shadcn add` updates
    // clean.
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
