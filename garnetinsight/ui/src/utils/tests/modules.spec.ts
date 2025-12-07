import { RedisDefaultModules } from 'uiSrc/slices/interfaces'
import {
  getDbWithModuleLoaded,
  IDatabaseModule,
  isContainJSONModule,
  isRedisearchAvailable,
  sortModules,
} from 'uiSrc/utils/modules'

const modules1: IDatabaseModule[] = [
  { moduleName: 'JSON', abbreviation: 'RS' },
  { moduleName: 'My1Module', abbreviation: 'MD' },
  { moduleName: 'Redis Query Engine', abbreviation: 'RS' },
]
const modules2: IDatabaseModule[] = [
  { moduleName: '', abbreviation: '' },
  { moduleName: '', abbreviation: '' },
  { moduleName: 'Probabilistic', abbreviation: 'RS' },
  { moduleName: '', abbreviation: '' },
  { moduleName: '', abbreviation: '' },
  { moduleName: 'MycvModule', abbreviation: 'MC' },
  { moduleName: 'My1Module', abbreviation: 'MD' },
  { moduleName: 'JSON', abbreviation: 'RS' },
  { moduleName: 'My2Modul2e', abbreviation: 'MX' },
  { moduleName: 'Redis Query Engine', abbreviation: 'RS' },
]

const result1: IDatabaseModule[] = [
  { moduleName: 'Redis Query Engine', abbreviation: 'RS' },
  { moduleName: 'JSON', abbreviation: 'RS' },
  { moduleName: 'My1Module', abbreviation: 'MD' },
]

const result2: IDatabaseModule[] = [
  { moduleName: 'Redis Query Engine', abbreviation: 'RS' },
  { moduleName: 'JSON', abbreviation: 'RS' },
  { moduleName: 'Probabilistic', abbreviation: 'RS' },
  { moduleName: 'MycvModule', abbreviation: 'MC' },
  { moduleName: 'My1Module', abbreviation: 'MD' },
  { moduleName: 'My2Modul2e', abbreviation: 'MX' },
  { moduleName: '', abbreviation: '' },
  { moduleName: '', abbreviation: '' },
  { moduleName: '', abbreviation: '' },
  { moduleName: '', abbreviation: '' },
]

describe('sortModules', () => {
  it('should proper sort modules list', () => {
    expect(sortModules(modules1)).toEqual(result1)
    expect(sortModules(modules2)).toEqual(result2)
  })
})

const nameToModule = (name: string) => ({ name })

const getOutputForRedisearchAvailable: any[] = [
  [['1', 'json'].map(nameToModule), false],
  [['1', 'uoeuoeu ueaooe'].map(nameToModule), false],
  [['1', 'json', RedisDefaultModules.Search].map(nameToModule), true],
  [['1', 'json', RedisDefaultModules.SearchLight].map(nameToModule), true],
  [['1', 'json', RedisDefaultModules.FT].map(nameToModule), true],
  [['1', 'json', RedisDefaultModules.FTL].map(nameToModule), true],
]

describe('isRedisearchAvailable', () => {
  it.each(getOutputForRedisearchAvailable)(
    'for input: %s (reply), should be output: %s',
    (reply, expected) => {
      const result = isRedisearchAvailable(reply)
      expect(result).toBe(expected)
    },
  )
})

const getOutputForReJSONAvailable: any[] = [
  [['1', 'json'].map(nameToModule), false],
  [['1', 'json', RedisDefaultModules.ReJSON].map(nameToModule), true],
  [['1', 'json', RedisDefaultModules.SearchLight].map(nameToModule), false],
  [
    [
      '1',
      'json',
      RedisDefaultModules.SearchLight,
      RedisDefaultModules.ReJSON,
    ].map(nameToModule),
    true,
  ],
]

describe('isContainJSONModule', () => {
  it.each(getOutputForReJSONAvailable)(
    'for input: %s (reply), should be output: %s',
    (reply, expected) => {
      const result = isContainJSONModule(reply)
      expect(result).toBe(expected)
    },
  )
})

const getDbWithModuleLoadedTests: Array<{
  input: [any, string]
  expected: any
}> = [
  {
    input: [
      [
        { id: '1', modules: [{ name: 'module1' }] },
        { id: '2', modules: [{ name: 'module1' }] },
      ],
      'module1',
    ],
    expected: { id: '1', modules: [{ name: 'module1' }] },
  },
  {
    input: [
      [
        { id: '1', modules: [{ name: 'module2' }] },
        { id: '2', modules: [{ name: 'module3' }] },
      ],
      'module1',
    ],
    expected: undefined,
  },
  {
    input: [
      [
        { id: '1', modules: [{ name: 'redisgears' }] },
        { id: '2', modules: [{ name: 'redisgears_2' }] },
      ],
      'redisgears',
    ],
    expected: { id: '1', modules: [{ name: 'redisgears' }] },
  },
]

describe('getDbWithModuleLoaded', () => {
  it.each(getDbWithModuleLoadedTests)(
    'for input: %s (reply), should be output: %s',
    ({ input, expected }) => {
      const result = getDbWithModuleLoaded(...input)
      expect(result).toEqual(expected)
    },
  )
})
