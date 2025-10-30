require('dotenv').config({ path: './redisinsight/ui/.env.test' });

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  testEnvironmentOptions: {
    url: 'http://localhost/',
    customExportConditions: [''],
  },
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|ico|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/redisinsight/__mocks__/fileMock.js',
    '\\.svg': '<rootDir>/redisinsight/__mocks__/svg.js',
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '\\.scss\\?inline$': '<rootDir>/redisinsight/__mocks__/scssRaw.js',
    'uiSrc/slices/store$': '<rootDir>/redisinsight/ui/src/utils/test-store.ts',
    'uiSrc/(.*)': '<rootDir>/redisinsight/ui/src/$1',
    'apiSrc/(.*)': '<rootDir>/redisinsight/api/src/$1',
    '@redislabsdev/redis-ui-components': '@redis-ui/components',
    '@redislabsdev/redis-ui-styles': '@redis-ui/styles',
    '@redislabsdev/redis-ui-icons': '@redis-ui/icons',
    '@redislabsdev/redis-ui-table': '@redis-ui/table',
    'monaco-editor': '<rootDir>/redisinsight/__mocks__/monacoMock.js',
    'monaco-yaml': '<rootDir>/redisinsight/__mocks__/monacoYamlMock.js',
    unified: '<rootDir>/redisinsight/__mocks__/unified.js',
    'remark-parse': '<rootDir>/redisinsight/__mocks__/remarkParse.js',
    'remark-gfm': '<rootDir>/redisinsight/__mocks__/remarkGfm.js',
    'remark-rehype': '<rootDir>/redisinsight/__mocks__/remarkRehype.js',
    'rehype-stringify': '<rootDir>/redisinsight/__mocks__/rehypeStringify.js',
    'unist-util-visit': '<rootDir>/redisinsight/__mocks__/unistUtilsVisit.js',
    d3: '<rootDir>/node_modules/d3/dist/d3.min.js',
    '^uuid$': require.resolve('uuid'),
    msgpackr: require.resolve('msgpackr'),
    'brotli-dec-wasm': '<rootDir>/redisinsight/__mocks__/brotli-dec-wasm.js',
    'react-resizable-panels':
      '<rootDir>/redisinsight/__mocks__/react-resizable-panels.js',
  },
  setupFiles: [
    'construct-style-sheets-polyfill',
    '<rootDir>/redisinsight/ui/src/setup-env.ts',
  ],
  setupFilesAfterEnv: ['<rootDir>/redisinsight/ui/src/setup-tests.ts'],
  moduleDirectories: ['node_modules', 'redisinsight/node_modules'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  testEnvironment: 'jest-fixed-jsdom',
  transformIgnorePatterns: [
    'node_modules/(?!(monaco-editor|react-monaco-editor|brotli-dec-wasm|until-async)/)',
  ],
  // TODO: add tests for plugins
  modulePathIgnorePatterns: [
    '<rootDir>/redisinsight/ui/src/packages',
    '<rootDir>/redisinsight/ui/src/mocks',
  ],
  coverageDirectory: './report/coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/redisinsight/api',
    '<rootDir>/redisinsight/ui/src/packages',
  ],
  resolver: '<rootDir>/jest-resolver.js',
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './report',
        filename: 'index.html',
      },
    ],
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 63,
      functions: 72,
      lines: 80,
    },
  },
  globals: {
    riConfig: {
      cloudAds: {
        defaultFlag: true,
      },
    },
  },
};
