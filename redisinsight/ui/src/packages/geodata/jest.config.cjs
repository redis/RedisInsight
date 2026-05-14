const path = require('path')

const rootDir = path.resolve(__dirname, '../../../../..')
const rootConfig = require(path.join(rootDir, 'jest.config.cjs'))

module.exports = {
  ...rootConfig,
  rootDir,
  moduleNameMapper: {
    ...rootConfig.moduleNameMapper,
    '^react$': '<rootDir>/node_modules/react',
    '^react-dom$': '<rootDir>/node_modules/react-dom',
  },
  modulePathIgnorePatterns: [
    '<rootDir>/redisinsight/api',
    '<rootDir>/redisinsight/desktop',
    '<rootDir>/redisinsight/ui/src/mocks',
    '<rootDir>/tests',
  ],
  coveragePathIgnorePatterns: ['/node_modules/'],
  coverageThreshold: undefined,
  reporters: ['default'],
  roots: ['<rootDir>/redisinsight/ui/src/packages/geodata/src'],
  setupFilesAfterEnv: [
    '<rootDir>/redisinsight/ui/src/packages/geodata/src/jest.setup.ts',
  ],
  testMatch: [
    '<rootDir>/redisinsight/ui/src/packages/geodata/src/**/*.spec.ts',
    '<rootDir>/redisinsight/ui/src/packages/geodata/src/**/*.spec.tsx',
  ],
}
