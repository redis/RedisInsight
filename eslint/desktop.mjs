/**
 * ESLint configuration for Desktop (Electron main process)
 * Path: redisinsight/desktop/
 */
import tseslint from 'typescript-eslint'
import globals from 'globals'
import {
  relaxedTypeScriptRules,
  commonRules,
  noUnusedVarsConfig,
  linterOptions,
  legacyPlugins,
  legacyDisabledRules,
} from './base.mjs'

// Desktop-specific rules
const desktopRules = {
  // TypeScript rules (relaxed)
  ...relaxedTypeScriptRules,
  '@typescript-eslint/no-unused-vars': noUnusedVarsConfig,

  // General rules
  ...commonRules,
  'no-console': ['error', { allow: ['warn', 'error'] }],
  
  // Disabled to match current behavior
  'prefer-const': 'off', // TODO: Enable gradually
  'prefer-destructuring': 'off', // TODO: Enable gradually
}

// Desktop source files configuration
export const desktopConfig = {
  files: ['redisinsight/desktop/**/*.ts'],
  ignores: [
    'redisinsight/desktop/dist/**',
    'redisinsight/desktop/node_modules/**',
  ],
  linterOptions,
  plugins: {
    '@typescript-eslint': tseslint.plugin,
    ...legacyPlugins,
  },
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    parser: tseslint.parser,
    globals: {
      ...globals.node,
      ...globals.es2021,
    },
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname.replace('/eslint', ''),
    },
  },
  rules: {
    ...desktopRules,
    ...legacyDisabledRules,
  },
}

