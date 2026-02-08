/**
 * Base ESLint configuration shared across all projects
 * Contains common rules and settings
 */
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
// Legacy plugins - kept only to prevent "Definition for rule was not found" errors
// from old eslint-disable comments in the codebase. All rules are disabled.
// TODO: Remove these plugins after cleaning up old eslint-disable comments
import sonarjsPlugin from 'eslint-plugin-sonarjs';
import importPlugin from 'eslint-plugin-import';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';

// Shared rule configurations
export const noUnusedVarsConfig = [
  'error',
  {
    argsIgnorePattern: '^_',
    varsIgnorePattern: '^_',
    destructuredArrayIgnorePattern: '^_',
  },
];

// Base TypeScript rules (strict - for gradual enablement)
export const strictTypeScriptRules = {
  '@typescript-eslint/no-unused-vars': noUnusedVarsConfig,
  '@typescript-eslint/no-explicit-any': 'warn',
  '@typescript-eslint/explicit-function-return-type': 'off',
  '@typescript-eslint/explicit-module-boundary-types': 'off',
  '@typescript-eslint/no-non-null-assertion': 'warn',
  '@typescript-eslint/ban-ts-comment': 'warn',
};

// Relaxed TypeScript rules (matching current codebase)
export const relaxedTypeScriptRules = {
  '@typescript-eslint/no-unused-vars': noUnusedVarsConfig,
  '@typescript-eslint/no-explicit-any': 'off', // TODO: Enable gradually
  '@typescript-eslint/explicit-function-return-type': 'off',
  '@typescript-eslint/explicit-module-boundary-types': 'off',
  '@typescript-eslint/no-non-null-assertion': 'off', // TODO: Enable gradually
  '@typescript-eslint/ban-ts-comment': 'off', // TODO: Enable gradually
  '@typescript-eslint/no-empty-object-type': 'off', // TODO: Enable gradually
  '@typescript-eslint/no-unsafe-function-type': 'off', // TODO: Enable gradually
  '@typescript-eslint/no-require-imports': 'off',
  '@typescript-eslint/no-wrapper-object-types': 'off', // TODO: Enable gradually
};

// Common general rules
export const commonRules = {
  'no-var': 'error',
  eqeqeq: ['error', 'always', { null: 'ignore' }],
  'no-unsafe-optional-chaining': 'off', // TODO: Enable gradually
};

// Base configs to extend
export const baseConfigs = [js.configs.recommended];

// TypeScript configs
export const tsConfigs = tseslint.configs.recommended;

// Prettier config (always last)
export const prettier = prettierConfig;

// Linter options to suppress warnings about unused disable directives
// TODO: Clean up old eslint-disable comments, then set to 'warn' or 'error'
export const linterOptions = {
  reportUnusedDisableDirectives: 'off',
};

// Legacy plugins - registered but with all rules disabled
// This prevents "Definition for rule was not found" errors from old eslint-disable comments
// TODO: Remove after cleaning up old eslint-disable comments in a separate PR
export const legacyPlugins = {
  sonarjs: sonarjsPlugin,
  import: importPlugin,
  'jsx-a11y': jsxA11yPlugin,
};

// Generate rules to disable all legacy plugin rules
const disableLegacyRules = (pluginName, plugin) => {
  const rules = {};
  if (plugin.rules) {
    Object.keys(plugin.rules).forEach((ruleName) => {
      rules[`${pluginName}/${ruleName}`] = 'off';
    });
  }
  return rules;
};

// All legacy plugin rules disabled
export const legacyDisabledRules = {
  ...disableLegacyRules('sonarjs', sonarjsPlugin),
  ...disableLegacyRules('import', importPlugin),
  ...disableLegacyRules('jsx-a11y', jsxA11yPlugin),
  // Also disable @typescript-eslint/quotes which was removed in v8
  '@typescript-eslint/quotes': 'off',
};

// Global ignores for all configs
export const globalIgnores = {
  ignores: [
    // Dependencies and build outputs
    '**/node_modules/**',
    '**/dist/**',
    '**/release/**',
    '**/coverage/**',
    '**/dll/**',
    '**/report/**',

    // Test artifacts
    '**/__snapshots__/**',

    // Logs and temp files
    '**/logs/**',
    '*.log',

    // Build configs (lint separately if needed)
    '**/scripts/**',
    '**/configs/**',

    // Package-specific ignores
    'redisinsight/ui/src/packages/**',
    'redisinsight/api/static/**',
    'redisinsight/api/migration/**',
    'redisinsight/api/report/**',
    'redisinsight/api/test/test-runs/**',

    // E2E tests (have their own config)
    'tests/e2e/**',
    'tests/e2e-playwright/**',

    // Config files at root
    '*.js',
    '*.cjs',
    '*.mjs',
    'eslint.config.mjs', // Don't lint the config itself

    // Build artifacts
    '*.main.prod.js',
    '*.renderer.prod.js',
    '*.main.js',
  ],
};
