const path = require('path');

module.exports = {
  root: true,
  env: {
    browser: true,
  },
  extends: [
    'airbnb-typescript',
    'airbnb/hooks',
    'plugin:sonarjs/recommended',
    'prettier',
  ],
  // extends: ['airbnb', 'airbnb/hooks'],
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: path.join(__dirname, '../../tsconfig.json'),
    createDefaultProgram: true,
  },

  overrides: [
    {
      files: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.spec.ts'],
      env: {
        jest: true,
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/semi': ['error', 'never'],
        semi: 'off',
      },
    },
    {
      files: ['*.js', '*.jsx'],
      rules: {
        semi: ['error', 'always'],
        '@typescript-eslint/semi': 'off',
      },
    },
  ],
  ignorePatterns: [
    'dist',
    'src/packages/redisearch/src/icons/*.js',
    'src/packages/common/src/icons/*.js',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    radix: 'off',
    semi: ['error', 'always'],
    'no-bitwise': ['error', { allow: ['|'] }],
    'max-len': [
      'error',
      {
        ignoreComments: true,
        ignoreStrings: true,
        ignoreRegExpLiterals: true,
        code: 120,
      },
    ],
    'class-methods-use-this': 'off',
    // A temporary hack related to IDE not resolving correct package.json
    'import/no-extraneous-dependencies': 'off',
    'import/prefer-default-export': 'off',
    'import/no-cycle': 'off',
    'import/no-named-as-default-member': 'off',
    'no-plusplus': 'off',
    'no-return-await': 'off',
    'no-underscore-dangle': 'off',
    'no-useless-catch': 'off',
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'jsx-a11y/anchor-is-valid': 'off',
    'jsx-a11y/no-access-key': 'off',
    'max-classes-per-file': 'off',
    'no-case-declarations': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/require-default-props': 'off',
    'react/prop-types': 1,
    'react/jsx-one-expression-per-line': 'off',
    '@typescript-eslint/comma-dangle': 'off',
    '@typescript-eslint/no-shadow': 'off',
    '@typescript-eslint/no-unused-expressions': 'off',
    '@typescript-eslint/semi': ['error', 'never'],
    '@typescript-eslint/no-use-before-define': 'off',
    'implicit-arrow-linebreak': 'off',
    'object-curly-newline': 'off',
    'no-nested-ternary': 'off',
    'no-param-reassign': ['error', { props: false }],
    'sonarjs/no-duplicate-string': 'off',
    'sonarjs/cognitive-complexity': [1, 20],
    'sonarjs/no-identical-functions': [0, 5],
    'import/order': [
      1,
      {
        groups: [
          'external',
          'builtin',
          'internal',
          'sibling',
          'parent',
          'index',
        ],
        pathGroups: [
          {
            pattern: 'uiSrc/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: 'apiSrc/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: '{.,..}/*.scss', // same directory only
            // pattern: '{.,..}/**/*\.scss' // same & outside directories (e.g. import '../foo/foo.scss')
            group: 'object',
            position: 'after',
          },
        ],
        warnOnUnassignedImports: true,
        pathGroupsExcludedImportTypes: ['builtin'],
      },
    ],
  },
};
