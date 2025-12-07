import { RootState, store } from 'uiSrc/slices/store'
import { TelemetryEvent } from '../events'
import {
  getRedisModulesSummary,
  getFreeDbFlag,
  getJsonPathLevel,
} from '../telemetryUtils'

const DEFAULT_SUMMARY = Object.freeze({
  RediSearch: { loaded: false },
  RedisAI: { loaded: false },
  RedisGraph: { loaded: false },
  RedisGears: { loaded: false },
  RedisBloom: { loaded: false },
  RedisJSON: { loaded: false },
  RedisTimeSeries: { loaded: false },
  customModules: [],
})

const getRedisModulesSummaryTests = [
  {
    input: [{ name: 'ai', version: 20000 }],
    expected: {
      ...DEFAULT_SUMMARY,
      RedisAI: { loaded: true, version: 20000 },
      customModules: [],
    },
  },
  {
    input: [{ name: 'search', version: 10000 }],
    expected: {
      ...DEFAULT_SUMMARY,
      RediSearch: { loaded: true, version: 10000 },
    },
  },
  {
    input: [
      { name: 'bf', version: 1000 },
      { name: 'rediSQL', version: 1 },
    ],
    expected: {
      ...DEFAULT_SUMMARY,
      RedisBloom: { loaded: true, version: 1000 },
      customModules: [{ name: 'rediSQL', version: 1 }],
    },
  },
  {
    input: [{ name: 'ReJSON' }],
    expected: { ...DEFAULT_SUMMARY, RedisJSON: { loaded: true } },
  },
  {
    input: [
      { name: 'ai', version: 10000, semanticVersion: '1.0.0' },
      { name: 'graph', version: 20000, semanticVersion: '2.0.0' },
      { name: 'rg', version: 10000, semanticVersion: '1.0.0' },
      { name: 'bf' },
      { name: 'ReJSON', version: 10000, semanticVersion: '1.0.0' },
      { name: 'search', version: 10000, semanticVersion: '1.0.0' },
      { name: 'timeseries', version: 10000, semanticVersion: '1.0.0' },
      { name: 'redisgears_2', version: 10000, semanticVersion: '1.0.0' },
    ],
    expected: {
      RedisAI: { loaded: true, version: 10000, semanticVersion: '1.0.0' },
      RedisGraph: { loaded: true, version: 20000, semanticVersion: '2.0.0' },
      RedisGears: { loaded: true, version: 10000, semanticVersion: '1.0.0' },
      RedisBloom: { loaded: true },
      RedisJSON: { loaded: true, version: 10000, semanticVersion: '1.0.0' },
      RediSearch: { loaded: true, version: 10000, semanticVersion: '1.0.0' },
      RedisTimeSeries: {
        loaded: true,
        version: 10000,
        semanticVersion: '1.0.0',
      },
      customModules: [
        { name: 'redisgears_2', version: 10000, semanticVersion: '1.0.0' },
      ],
    },
  },
  { input: [], expected: DEFAULT_SUMMARY },
  { input: {}, expected: DEFAULT_SUMMARY },
  { input: undefined, expected: DEFAULT_SUMMARY },
  { input: null, expected: DEFAULT_SUMMARY },
  { input: 1, expected: DEFAULT_SUMMARY },
]

describe('getRedisModulesSummary', () => {
  test.each(getRedisModulesSummaryTests)('%j', ({ input, expected }) => {
    // @ts-ignore
    const result = getRedisModulesSummary(input)
    expect(result).toEqual(expected)
  })
})

describe('determineFreeDbFlag', () => {
  describe.each`
    isFreeDb
    ${true}
    ${false}
  `('when isFreeDb=$isFreeDb', ({ isFreeDb }) => {
    beforeEach(() => {
      jest.spyOn(store, 'getState').mockImplementation(
        () =>
          ({
            connections: {
              instances: {
                connectedInstance: {
                  isFreeDb,
                },
              },
            },
          }) as RootState,
      )
    })

    it(`returns { isFree: ${isFreeDb} } for an event in the freeDbEvents list`, () => {
      const freeDbEvents = [
        TelemetryEvent.INSIGHTS_PANEL_OPENED,
        TelemetryEvent.INSIGHTS_PANEL_CLOSED,
      ]
      const event = TelemetryEvent.INSIGHTS_PANEL_OPENED

      const result = getFreeDbFlag(event, freeDbEvents)

      expect(result).toEqual({ isFree: isFreeDb })
    })

    it('returns {} for an event NOT in the freeDbEvents list', () => {
      const freeDbEvents = [
        TelemetryEvent.INSIGHTS_PANEL_OPENED,
        TelemetryEvent.INSIGHTS_PANEL_CLOSED,
      ]
      const event = TelemetryEvent.AI_CHAT_BOT_COMMAND_RUN_CLICKED

      const result = getFreeDbFlag(event, freeDbEvents)

      expect(result).toEqual({})
    })
  })

  it('returns {} if there is no connected instance', () => {
    jest.spyOn(store, 'getState').mockImplementation(
      () =>
        ({
          connections: {
            instances: {},
          },
        }) as RootState,
    )

    const freeDbEvents = [
      TelemetryEvent.INSIGHTS_PANEL_OPENED,
      TelemetryEvent.INSIGHTS_PANEL_CLOSED,
    ]
    const event = TelemetryEvent.INSIGHTS_PANEL_OPENED

    const result = getFreeDbFlag(event, freeDbEvents)

    expect(result).toEqual({})
  })
})

describe('getJsonPathLevel', () => {
  it('returns 0 for empty or root path', () => {
    expect(getJsonPathLevel('')).toBe(0)
    expect(getJsonPathLevel('$')).toBe(0)
  })

  it('returns 1 for top-level properties', () => {
    expect(getJsonPathLevel('$.foo')).toBe(1)
    expect(getJsonPathLevel('$[0]')).toBe(1)
  })

  it('returns correct level for nested dot paths', () => {
    expect(getJsonPathLevel('$.foo.bar')).toBe(2)
    expect(getJsonPathLevel('$.foo.bar.baz')).toBe(3)
  })

  it('returns correct level for mixed dot and bracket paths', () => {
    expect(getJsonPathLevel('$.foo[0].bar')).toBe(3)
    expect(getJsonPathLevel('$[0].foo.bar')).toBe(3)
    expect(getJsonPathLevel('$[0][1][2]')).toBe(3)
  })

  it('returns correct level for complex mixed paths', () => {
    expect(getJsonPathLevel('$.foo[1].bar[2].baz')).toBe(5)
    expect(getJsonPathLevel('$[0].foo[1].bar')).toBe(4)
  })

  it('handles malformed paths gracefully', () => {
    expect(getJsonPathLevel('.foo.bar')).toBe(2) // missing $
    expect(getJsonPathLevel('foo.bar')).toBe(2) // missing $
    expect(getJsonPathLevel('$foo.bar')).toBe(2) // $ not followed by dot
  })

  it('returns 0 if an exception is thrown (e.g., non-string)', () => {
    // @ts-expect-error testing runtime failure
    expect(getJsonPathLevel(null)).toBe(0)
    // @ts-expect-error testing runtime failure
    expect(getJsonPathLevel(undefined)).toBe(0)
    // @ts-expect-error testing runtime failure
    expect(getJsonPathLevel({})).toBe(0)
  })
})
