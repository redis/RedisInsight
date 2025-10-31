const path = require('path');

module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
  },
  extends: ['airbnb-typescript', 'prettier', 'plugin:prettier/recommended'],
  plugins: ['@typescript-eslint', 'import', 'prettier'],
  parser: '@typescript-eslint/parser',
  rules: {
    quotes: [2, 'single', { avoidEscape: true }],
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
    'import/no-extraneous-dependencies': 'off', // temporary disabled
    'object-curly-newline': 'off',
    'import/prefer-default-export': 'off',
    '@typescript-eslint/comma-dangle': 'off',
    'implicit-arrow-linebreak': 'off',
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
            pattern: 'desktopSrc/**',
            group: 'internal',
            position: 'after',
          },
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
        ],
        warnOnUnassignedImports: true,
        pathGroupsExcludedImportTypes: ['builtin'],
      },
    ],
  },
  overrides: [
    // Backend/API specific rules
    {
      files: ['redisinsight/api/**/*.ts', 'redisinsight/api/**/*.js'],
      env: {
        node: true,
        browser: false,
      },
      extends: [
        'airbnb-typescript/base',
        'prettier',
        'plugin:prettier/recommended',
      ],
      plugins: ['@typescript-eslint', 'sonarjs', 'import', 'prettier'],
      rules: {
        'max-len': ['warn', 120],
        '@typescript-eslint/return-await': 'off',
        '@typescript-eslint/dot-notation': 'off',
        'import/no-extraneous-dependencies': 'off',
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
          },
        ],
        // SonarJS rules (manually enabled since v2.x doesn't have recommended config)
        'sonarjs/cognitive-complexity': ['error', 15],
        'sonarjs/no-duplicate-string': 'error',
        'sonarjs/no-identical-functions': 'error',
        'sonarjs/prefer-immediate-return': 'error',
        'sonarjs/no-small-switch': 'error',
        'sonarjs/no-nested-template-literals': 'off',
        'no-console': 'error',
        'import/no-duplicates': 'error',
        'prefer-destructuring': 'error',
        'no-unneeded-ternary': 'error',
        'prefer-template': 'error',
        'prefer-const': 'error',
      },
      parserOptions: {
        project: path.join(__dirname, 'redisinsight/api/tsconfig.json'),
      },
    },
    // Backend test files
    {
      files: [
        'redisinsight/api/**/*.spec.ts',
        'redisinsight/api/**/__mocks__/**/*',
      ],
      rules: {
        'sonarjs/no-duplicate-string': 0,
        'sonarjs/no-identical-functions': 0,
        'import/first': 0,
      },
    },
    // Frontend/UI specific rules
    {
      files: [
        'redisinsight/ui/**/*.ts',
        'redisinsight/ui/**/*.tsx',
        'redisinsight/ui/**/*.js',
        'redisinsight/ui/**/*.jsx',
      ],
      env: {
        browser: true,
        node: false,
      },
      extends: [
        'airbnb-typescript',
        'airbnb/hooks',
        'prettier',
        'plugin:prettier/recommended',
      ],
      plugins: [
        '@typescript-eslint',
        'sonarjs',
        'import',
        'react',
        'react-hooks',
        'jsx-a11y',
        'prettier',
      ],
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: path.join(__dirname, 'tsconfig.json'),
        createDefaultProgram: true,
      },
      rules: {
        radix: 'off',
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
        '@typescript-eslint/no-use-before-define': 'off',
        'implicit-arrow-linebreak': 'off',
        'object-curly-newline': 'off',
        'no-nested-ternary': 'off',
        'no-param-reassign': ['error', { props: false }],
        'sonarjs/no-duplicate-string': 'off',
        'sonarjs/cognitive-complexity': [1, 20],
        'sonarjs/no-identical-functions': [0, 5],
        'sonarjs/prefer-immediate-return': 'error',
        'sonarjs/no-small-switch': 'error',
        'import/no-duplicates': 'error',
        'prefer-destructuring': 'error',
        'no-unneeded-ternary': 'error',
        'prefer-template': 'error',
        'prefer-const': 'error',
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
                pattern: '{.,..}/*.scss',
                group: 'object',
                position: 'after',
              },
            ],
            warnOnUnassignedImports: true,
            pathGroupsExcludedImportTypes: ['builtin'],
          },
        ],
      },
    },
    // UI test files
    {
      files: ['redisinsight/ui/**/*.spec.ts', 'redisinsight/ui/**/*.spec.tsx'],
      env: {
        jest: true,
      },
    },
    // TypeScript files (general) - MUST BE LAST to override other rules
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/semi': ['error', 'never'],
        semi: 'off',
        '@typescript-eslint/default-param-last': 'off',
      },
    },
    // JavaScript files (general) - MUST BE LAST to override other rules
    {
      files: ['*.js', '*.jsx', '*.cjs'],
      rules: {
        semi: ['error', 'always'],
        '@typescript-eslint/semi': 'off',
      },
    },
    // Temporary disable some rules for API
    {
      files: ['redisinsight/api/**/*.ts', 'redisinsight/api/esbuild.js'],
      rules: {
        semi: 'off',
        '@typescript-eslint/semi': 'off',
        'sonarjs/no-identical-functions': 'off',
        'sonarjs/prefer-immediate-return': 'off',
        'sonarjs/no-duplicate-string': 'off',
        'sonarjs/cognitive-complexity': 'off',
        'sonarjs/no-small-switch': 'off',
        'max-len': 'off',
        'import/order': 'off',
        'no-underscore-dangle': 'off',
        'import/no-duplicates': 'off',
        'no-console': 'off',
        'prefer-destructuring': 'off',
        'no-unneeded-ternary': 'off',
        'prefer-template': 'off',
        'prefer-const': 'off',
        // REDUNDANT: These are OFF by default in newer Airbnb config
        // 'prefer-arrow-callback': 'off',
        // 'no-restricted-syntax': 'off',
        // 'no-control-regex': 'off',
        // 'func-names': 'off',
        // 'no-case-declarations': 'off',
        // radix: 'off',
        // 'arrow-body-style': 'off',
        // 'no-constant-condition': 'off',
        // 'consistent-return': 'off',
        // 'no-useless-concat': 'off',
        // 'import/export': 'off',
      },
    },
    // Temporary (maybe) disable some rules for API tests
    {
      files: ['redisinsight/api/test/**/*.ts'],
      // In order to lint just the test files
      // make sure there's no override on 'redisinsight/api'
      // a.k.a. comment the above section
      rules: {
        '@typescript-eslint/no-loop-func': 'off',
        '@typescript-eslint/semi': 'off',
        'no-console': 'off',
        'prefer-template': 'off',
        'import/order': 'off',
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-shadow': 'off',
        '@typescript-eslint/no-unused-expressions': 'off',
        '@typescript-eslint/naming-convention': 'off',
        'sonarjs/no-duplicate-string': 'off',
        'sonarjs/prefer-immediate-return': 'off',
        'sonarjs/cognitive-complexity': 'off',
        'prettier/prettier': 'off',
        'max-len': 'off',
        'prefer-destructuring': 'off',
        'prefer-const': 'off',
        // REDUNDANT: These are OFF by default in newer Airbnb config
        // semi: 'off',
        // 'sonarjs/no-ignored-return': 'off',
        // 'sonarjs/no-identical-expressions': 'off',
        // 'sonarjs/no-nested-switch': 'off',
        // 'sonarjs/no-identical-functions': 'off',
        // 'no-plusplus': 'off',
        // 'array-callback-return': 'off',
        // 'no-underscore-dangle': 'off',
        // 'import/newline-after-import': 'off',
        // 'global-require': 'off',
        // 'object-shorthand': 'off',
        // 'import/no-useless-path-segments': 'off',
        // 'import/first': 'off',
        // 'one-var': 'off',
        // 'no-multi-assign': 'off',
        // 'spaced-comment': 'off',
        // 'no-lonely-if': 'off',
        // 'no-useless-computed-key': 'off',
        // 'no-return-assign': 'off',
        // 'prefer-promise-reject-errors': 'off',
        // 'no-fallthrough': 'off',
        // 'no-else-return': 'off',
        // 'no-empty': 'off',
        // 'import/no-mutable-exports': 'off',
        // 'import/no-cycle': 'off',
        // 'no-useless-escape': 'off',
        // 'default-case': 'off',
        // eqeqeq: 'off',
        // yoda: 'off',
        // 'prefer-arrow-callback': 'off',
        // 'arrow-body-style': 'off',
        // 'no-constant-condition': 'off',
        // 'no-restricted-syntax': 'off',
        // 'no-case-declarations': 'off',
        // 'func-names': 'off',
        // 'consistent-return': 'off',
        // radix: 'off',
      },
    },
    // Temporary disable some rules for UI
    {
      files: ['redisinsight/ui/**/*.ts*'],
      rules: {
        'sonarjs/cognitive-complexity': 'off',
        'import/extensions': 'off',
        'react/prop-types': 'off',
        'import/order': 'off',
        'prefer-const': 'off',
        'prefer-destructuring': 'off',
        // REDUNDANT: These are OFF by default in newer Airbnb config
        // 'react/jsx-boolean-value': 'off',
        // 'sonarjs/no-nested-template-literals': 'off',
        // 'sonarjs/no-extra-arguments': 'off',
        // 'consistent-return': 'off',
        // 'react/no-array-index-key': 'off',
        // 'react/no-unused-prop-types': 'off',
        // 'react/destructuring-assignment': 'off',
        // 'jsx-a11y/control-has-associated-label': 'off',
        // 'react/button-has-type': 'off',
        // 'react/no-unescaped-entities': 'off',
        // 'no-useless-escape': 'off',
        // 'no-template-curly-in-string': 'off',
      },
    },
    // Temporary disable some rules for UI packages
    {
      // In order to lint just UI packages
      // make sure there's no override on 'redisinsight/ui'
      // a.k.a. comment the above section
      files: ['redisinsight/ui/src/packages/**/*.ts*'],
      rules: {
        'import/extensions': 'off',
        'react/prop-types': 'off',
        'react-hooks/rules-of-hooks': 'off',
        'sonarjs/cognitive-complexity': 'off',
        'max-len': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'prefer-destructuring': 'off',
      },
    },
    // Temporary disable some rules for Playwright tests
    {
      files: ['tests/playwright/**/*.ts*'],
      rules: {
        'prettier/prettier': 'off',
      },
    },
  ],
  parserOptions: {
    project: './tsconfig.json',
    ecmaVersion: 2020,
    sourceType: 'module',
    createDefaultProgram: true,
  },
  settings: {
    react: {
      version: 'detect', // Automatically detect React version
    },
  },
  ignorePatterns: [
    'dist',
    'node_modules',
    'release',
    'redisinsight/ui/src/packages/**/icons/*.js*',
    'redisinsight/ui/src/packages/**',
    'redisinsight/api/report/**',
    'redisinsight/api/static/**',
    'redisinsight/api/migration/**',
    // Config files that don't need linting
    '.eslintrc.js',
    'electron-builder-mas.js',
    'jest-resolver.js',
    'resources/resources.d.ts',
  ],
};
