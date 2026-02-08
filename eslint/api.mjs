/**
 * ESLint configuration for Backend (NestJS/API)
 * Path: redisinsight/api/
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

// API-specific rules matching current .eslintrc.js behavior
// Note: Many rules are disabled to match current "temporary disable" section
const apiRules = {
  // TypeScript rules (relaxed to match current)
  ...relaxedTypeScriptRules,
  '@typescript-eslint/no-unused-expressions': 'off',
  '@typescript-eslint/no-use-before-define': 'off',
  '@typescript-eslint/no-shadow': 'off',
  '@typescript-eslint/no-loop-func': 'off',

  // General rules
  ...commonRules,
  
  // Disabled to match current behavior (from "Temporary disable some rules for API")
  'no-console': 'off', // TODO: Enable gradually
  'prefer-const': 'off', // TODO: Enable gradually
  'prefer-destructuring': 'off', // TODO: Enable gradually
  'prefer-template': 'off', // TODO: Enable gradually
  'no-unneeded-ternary': 'off', // TODO: Enable gradually
  'no-underscore-dangle': 'off',
  'max-len': 'off',
}

// API source files configuration
export const apiConfig = {
  files: ['redisinsight/api/src/**/*.ts'],
  ignores: ['redisinsight/api/src/**/*.spec.ts'],
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
    ...apiRules,
    ...legacyDisabledRules,
  },
}

// API unit test files (src/**/*.spec.ts)
export const apiUnitTestConfig = {
  files: ['redisinsight/api/src/**/*.spec.ts'],
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
      ...globals.jest,
    },
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname.replace('/eslint', ''),
    },
  },
  rules: {
    ...apiRules,
    ...legacyDisabledRules,
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-unused-vars': noUnusedVarsConfig,
  },
}

// API integration test files (test/**/*.ts)
export const apiIntegrationTestConfig = {
  files: ['redisinsight/api/test/**/*.ts'],
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
      ...globals.jest,
    },
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname.replace('/eslint', ''),
    },
  },
  rules: {
    ...apiRules,
    ...legacyDisabledRules,
    // Even more relaxed for integration tests (matching current config)
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-unused-vars': noUnusedVarsConfig,
    '@typescript-eslint/naming-convention': 'off',
  },
}

