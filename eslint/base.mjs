/**
 * Base ESLint configuration shared across all projects
 * Contains common rules and settings
 */
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
// Additional plugins
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
    caughtErrorsIgnorePattern: '^_',
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

// Plugin exports
export const plugins = {
  sonarjs: sonarjsPlugin,
  import: importPlugin,
  'jsx-a11y': jsxA11yPlugin,
};

// SonarJS rules (matching old config behavior)
export const sonarjsRules = {
  'sonarjs/cognitive-complexity': ['error', 15],
  'sonarjs/no-duplicate-string': 'error',
  'sonarjs/no-identical-functions': 'error',
  'sonarjs/prefer-immediate-return': 'error',
  'sonarjs/no-small-switch': 'error',
  'sonarjs/no-nested-template-literals': 'off',
};

// SonarJS rules - temporarily disabled (TODO: Enable gradually)
export const sonarjsRulesDisabled = {
  'sonarjs/cognitive-complexity': 'off',
  'sonarjs/no-duplicate-string': 'off',
  'sonarjs/no-identical-functions': 'off',
  'sonarjs/prefer-immediate-return': 'off',
  'sonarjs/no-small-switch': 'off',
  'sonarjs/no-nested-template-literals': 'off',
};

// Import plugin rules (matching old config behavior)
export const importRules = {
  'import/no-duplicates': 'error',
  'import/order': [
    'warn',
    {
      groups: ['external', 'builtin', 'internal', 'sibling', 'parent', 'index'],
      pathGroups: [
        { pattern: 'desktopSrc/**', group: 'internal', position: 'after' },
        { pattern: 'uiSrc/**', group: 'internal', position: 'after' },
        { pattern: 'apiSrc/**', group: 'internal', position: 'after' },
        { pattern: '{.,..}/*.scss', group: 'object', position: 'after' },
      ],
      warnOnUnassignedImports: true,
      pathGroupsExcludedImportTypes: ['builtin'],
    },
  ],
  'import/no-extraneous-dependencies': 'off',
  'import/prefer-default-export': 'off',
  'import/no-cycle': 'off',
  'import/no-named-as-default-member': 'off',
  'import/extensions': 'off',
  'import/first': 'off',
};

// Import rules - temporarily disabled (TODO: Enable gradually)
export const importRulesDisabled = {
  'import/no-duplicates': 'off',
  'import/order': 'off',
};

// JSX A11y rules (matching old config - mostly disabled)
export const jsxA11yRules = {
  'jsx-a11y/anchor-is-valid': 'off',
  'jsx-a11y/no-access-key': 'off',
  'jsx-a11y/control-has-associated-label': 'off',
};

// Deprecated rules that need to be explicitly disabled
// (prevents "Definition for rule was not found" errors)
export const deprecatedRules = {
  '@typescript-eslint/quotes': 'off', // Removed in typescript-eslint v8
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
