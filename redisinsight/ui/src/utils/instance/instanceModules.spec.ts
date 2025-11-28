import {
  getModule,
  ensureSemanticVersion,
} from 'uiSrc/utils/instance/instanceModules'
import { AdditionalRedisModule } from 'uiSrc/slices/interfaces'
import { DBInstanceFactory } from 'uiSrc/mocks/factories/database/DBInstance.factory'

// Test fixtures
const moduleTestCases = [
  {
    input: 'RedisJSON',
    expected: {
      name: 'RedisJSON',
      abbreviation: 'RJ',
      descriptionContains: 'JSON',
    },
    description: 'exact name matches',
  },
  {
    input: 'redisjson',
    expected: {
      name: 'RedisJSON',
      abbreviation: 'RJ',
      descriptionContains: 'JSON',
    },
    description: 'name matches ignoring case',
  },
  {
    input: 'RedisTimeSeries',
    expected: {
      name: 'RedisTimeSeries',
      abbreviation: 'RT',
      descriptionContains: 'Time-series',
    },
    description: 'name matches with camelCase',
  },
  {
    input: 'RediSearch',
    expected: {
      name: 'RediSearch',
      abbreviation: 'RS',
      descriptionContains: 'Full-Text search',
    },
    description: 'name matches with different format',
  },
  {
    input: 'redis_time_series',
    expected: {
      name: 'RedisTimeSeries',
      abbreviation: 'RT',
      descriptionContains: 'Time-series',
    },
    description: 'module names with mixed case and separators',
  },
]

const emptyResultTestCases = [
  { input: 'NonExistentModule', description: 'module not found' },
  { input: '', description: 'propName is empty' },
  { input: undefined, description: 'propName is undefined' },
]

describe('instanceModules', () => {
  describe('getModule', () => {
    it.each(moduleTestCases)(
      'should return module when $description',
      ({ input, expected }) => {
        const result = getModule(input)
        expect(result.name).toBe(expected.name)
        expect(result.abbreviation).toBe(expected.abbreviation)
        expect(result.description).toContain(expected.descriptionContains)
      },
    )

    it.each(emptyResultTestCases)(
      'should return empty object when $description',
      ({ input }) => {
        const result = getModule(input)
        expect(result).toEqual({})
      },
    )
  })

  describe('ensureSemanticVersion', () => {
    const mockModule1: AdditionalRedisModule = {
      name: 'RedisJSON',
      version: 20400,
      semanticVersion: '',
    }

    const mockModule2: AdditionalRedisModule = {
      name: 'RediSearch',
      version: 20604,
      semanticVersion: '2.6.4',
    }

    const mockModule3: AdditionalRedisModule = {
      name: 'RedisTimeSeries',
      version: 10800,
      semanticVersion: '',
    }

    it('should convert numeric version to semantic version when semanticVersion is empty', () => {
      const mockInstance = DBInstanceFactory.build({
        modules: [mockModule1],
      })

      const result = ensureSemanticVersion(mockInstance)

      expect(result.modules).toHaveLength(1)
      expect(result.modules![0]).toEqual({
        ...mockModule1,
        semanticVersion: '2.4.0',
      })
    })

    it('should preserve existing semantic version when already present', () => {
      const mockInstance = DBInstanceFactory.build({
        modules: [mockModule2],
      })

      const result = ensureSemanticVersion(mockInstance)

      expect(result.modules).toHaveLength(1)
      expect(result.modules![0]).toEqual({
        ...mockModule2,
        semanticVersion: '2.6.4',
      })
    })

    it('should handle multiple modules with mixed semantic version states', () => {
      const mockInstance = DBInstanceFactory.build({
        modules: [mockModule1, mockModule2, mockModule3],
      })

      const result = ensureSemanticVersion(mockInstance)

      expect(result.modules).toHaveLength(3)
      expect(result.modules![0].semanticVersion).toBe('2.4.0')
      expect(result.modules![1].semanticVersion).toBe('2.6.4')
      expect(result.modules![2].semanticVersion).toBe('1.8.0')
    })

    it('should handle instance with no modules', () => {
      const mockInstance = DBInstanceFactory.build({
        modules: undefined as any,
      })

      const result = ensureSemanticVersion(mockInstance)

      expect(result.modules).toBeUndefined()
    })

    it('should handle instance with empty modules array', () => {
      const mockInstance = DBInstanceFactory.build({
        modules: [],
      })

      const result = ensureSemanticVersion(mockInstance)

      expect(result.modules).toEqual([])
    })

    it('should handle modules with version 0', () => {
      const moduleWithZeroVersion: AdditionalRedisModule = {
        name: 'TestModule',
        version: 0,
        semanticVersion: '',
      }

      const mockInstance = DBInstanceFactory.build({
        modules: [moduleWithZeroVersion],
      })

      const result = ensureSemanticVersion(mockInstance)

      expect(result.modules![0].semanticVersion).toBe('0')
    })

    it('should handle modules with undefined version', () => {
      const moduleWithUndefinedVersion: AdditionalRedisModule = {
        name: 'TestModule',
        version: undefined as any,
        semanticVersion: '',
      }

      const mockInstance = DBInstanceFactory.build({
        modules: [moduleWithUndefinedVersion],
      })

      const result = ensureSemanticVersion(mockInstance)

      expect(result.modules![0].semanticVersion).toBe('')
    })

    it('should handle modules with null version', () => {
      const moduleWithNullVersion: AdditionalRedisModule = {
        name: 'TestModule',
        version: null as any,
        semanticVersion: '',
      }

      const mockInstance = DBInstanceFactory.build({
        modules: [moduleWithNullVersion],
      })

      const result = ensureSemanticVersion(mockInstance)

      expect(result.modules![0].semanticVersion).toBe('')
    })

    it('should preserve other instance properties', () => {
      const mockInstance = DBInstanceFactory.build({
        id: 'test-id',
        name: 'Test Instance',
        host: 'localhost',
        port: 6379,
        modules: [mockModule1],
      })

      const result = ensureSemanticVersion(mockInstance)

      expect(result.id).toBe('test-id')
      expect(result.name).toBe('Test Instance')
      expect(result.host).toBe('localhost')
      expect(result.port).toBe(6379)
    })
  })

  describe('convert number to semantic version', () => {
    // These tests verify the behavior through ensureSemanticVersion since convertToSemanticVersion is not exported

    it('should convert 6-digit version correctly', () => {
      const mockModule: AdditionalRedisModule = {
        name: 'TestModule',
        version: 123456,
        semanticVersion: '',
      }

      const mockInstance = DBInstanceFactory.build({
        modules: [mockModule],
      })

      const result = ensureSemanticVersion(mockInstance)
      expect(result.modules![0].semanticVersion).toBe('12.34.56')
    })

    it('should pad shorter versions with zeros', () => {
      const mockModule: AdditionalRedisModule = {
        name: 'TestModule',
        version: 123,
        semanticVersion: '',
      }

      const mockInstance = DBInstanceFactory.build({
        modules: [mockModule],
      })

      const result = ensureSemanticVersion(mockInstance)
      expect(result.modules![0].semanticVersion).toBe('0.1.23')
    })

    it('should handle single digit versions', () => {
      const mockModule: AdditionalRedisModule = {
        name: 'TestModule',
        version: 5,
        semanticVersion: '',
      }

      const mockInstance = DBInstanceFactory.build({
        modules: [mockModule],
      })

      const result = ensureSemanticVersion(mockInstance)
      expect(result.modules![0].semanticVersion).toBe('0.0.5')
    })

    it('should handle large version numbers', () => {
      const mockModule: AdditionalRedisModule = {
        name: 'TestModule',
        version: 9876543,
        semanticVersion: '',
      }

      const mockInstance = DBInstanceFactory.build({
        modules: [mockModule],
      })

      const result = ensureSemanticVersion(mockInstance)
      expect(result.modules![0].semanticVersion).toBe('987.65.43')
    })

    it('should return string representation for negative numbers', () => {
      const mockModule: AdditionalRedisModule = {
        name: 'TestModule',
        version: -123,
        semanticVersion: '',
      }

      const mockInstance = DBInstanceFactory.build({
        modules: [mockModule],
      })

      const result = ensureSemanticVersion(mockInstance)
      expect(result.modules![0].semanticVersion).toBe('-123')
    })

    it('should return string representation for non-numeric values', () => {
      const mockModule: AdditionalRedisModule = {
        name: 'TestModule',
        version: 'invalid' as any,
        semanticVersion: '',
      }

      const mockInstance = DBInstanceFactory.build({
        modules: [mockModule],
      })

      const result = ensureSemanticVersion(mockInstance)
      expect(result.modules![0].semanticVersion).toBe('invalid')
    })
  })
})
