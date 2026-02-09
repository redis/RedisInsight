/**
 * ESLint configuration for Frontend (React/UI)
 * Path: redisinsight/ui/
 */
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import globals from 'globals';
import {
  relaxedTypeScriptRules,
  commonRules,
  noUnusedVarsConfig,
  linterOptions,
  plugins,
  sonarjsRulesDisabled,
  importRulesDisabled,
  jsxA11yRules,
  deprecatedRules,
} from './base.mjs';

// UI-specific rules matching current .eslintrc.js behavior
const uiRules = {
  // React rules
  ...reactPlugin.configs.recommended.rules,
  'react/react-in-jsx-scope': 'off', // Not needed with React 17+
  'react/prop-types': 'off', // Using TypeScript
  'react/jsx-uses-react': 'off',
  'react/jsx-uses-vars': 'error',
  'react/display-name': 'off', // TODO: Enable gradually (12 errors)
  'react/jsx-key': 'warn', // TODO: Change to error (20 errors)

  // React Hooks - using relaxed config to match current behavior
  'react-hooks/rules-of-hooks': 'error',
  'react-hooks/exhaustive-deps': 'off', // TODO: Enable gradually

  // Disable new strict react-hooks v7 rules for now
  'react-hooks/set-state-in-effect': 'off', // TODO: Enable gradually
  'react-hooks/immutability': 'off', // TODO: Enable gradually
  'react-hooks/preserve-manual-memoization': 'off', // TODO: Enable gradually
  'react-hooks/refs': 'off', // TODO: Enable gradually
  'react-hooks/static-components': 'off', // TODO: Enable gradually

  // TypeScript rules (relaxed to match current)
  ...relaxedTypeScriptRules,
  '@typescript-eslint/no-unused-expressions': 'off', // TODO: Enable gradually

  // General rules
  ...commonRules,
  'no-console': ['error', { allow: ['warn', 'error'] }],

  // Disabled to match current behavior
  'prefer-const': 'off', // TODO: Enable gradually
  'prefer-destructuring': 'off', // TODO: Enable gradually
  '@typescript-eslint/no-unused-vars': 'off',
  'react/no-unescaped-entities': 'off', // TODO: Enable gradually
};

// UI source files configuration
export const uiConfig = {
  files: ['redisinsight/ui/**/*.{ts,tsx}'],
  ignores: [
    'redisinsight/ui/**/*.spec.{ts,tsx}',
    'redisinsight/ui/**/*.test.{ts,tsx}',
  ],
  linterOptions,
  plugins: {
    '@typescript-eslint': tseslint.plugin,
    react: reactPlugin,
    'react-hooks': reactHooksPlugin,
    ...plugins,
  },
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    parser: tseslint.parser,
    globals: {
      ...globals.browser,
      ...globals.es2021,
    },
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      projectService: true,
      tsconfigRootDir: import.meta.dirname.replace('/eslint', ''),
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    ...uiRules,
    // SonarJS - TODO: Enable gradually
    ...sonarjsRulesDisabled,
    // Import - TODO: Enable gradually
    ...importRulesDisabled,
    // JSX A11y
    ...jsxA11yRules,
    // Deprecated rules
    ...deprecatedRules,
  },
};

// UI test files - more relaxed rules
export const uiTestConfig = {
  files: [
    'redisinsight/ui/**/*.spec.{ts,tsx}',
    'redisinsight/ui/**/*.test.{ts,tsx}',
  ],
  linterOptions,
  plugins: {
    '@typescript-eslint': tseslint.plugin,
    react: reactPlugin,
    'react-hooks': reactHooksPlugin,
    ...plugins,
  },
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    parser: tseslint.parser,
    globals: {
      ...globals.browser,
      ...globals.es2021,
      ...globals.jest,
    },
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      projectService: true,
      tsconfigRootDir: import.meta.dirname.replace('/eslint', ''),
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    ...uiRules,
    // SonarJS - TODO: Enable gradually
    ...sonarjsRulesDisabled,
    // Import - TODO: Enable gradually
    ...importRulesDisabled,
    // JSX A11y
    ...jsxA11yRules,
    // Deprecated rules
    ...deprecatedRules,
    // Even more relaxed for tests
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-unused-vars': noUnusedVarsConfig,
  },
};
