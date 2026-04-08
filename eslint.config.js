import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // Keep this codebase signal-focused: unused vars are warnings, not blockers
      'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]' }],
      // Too noisy for this codebase (many intentional "init-on-mount" effects)
      'react-hooks/set-state-in-effect': 'off',
      // Too strict for shared UI utility modules / route config patterns
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    // Tooling / config files run in Node (ESM in this repo)
    files: ['vite.config.js', 'tailwind.config.js', 'eslint.config.js', 'generate_pdf.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
])
