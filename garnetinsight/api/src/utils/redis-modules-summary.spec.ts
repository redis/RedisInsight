import { getRedisModulesSummary } from 'src/utils/redis-modules-summary';

const DEFAULT_SUMMARY = Object.freeze({
  RediSearch: { loaded: false },
  RedisAI: { loaded: false },
  RedisGraph: { loaded: false },
  RedisGears: { loaded: false },
  RedisBloom: { loaded: false },
  RedisJSON: { loaded: false },
  RedisTimeSeries: { loaded: false },
  customModules: [],
});

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
        {
          name: 'redisgears_2',
          semanticVersion: '1.0.0',
          version: 10000,
        },
      ],
    },
  },
  { input: [], expected: DEFAULT_SUMMARY },
  { input: {}, expected: DEFAULT_SUMMARY },
  { input: undefined, expected: DEFAULT_SUMMARY },
  { input: null, expected: DEFAULT_SUMMARY },
  { input: 1, expected: DEFAULT_SUMMARY },
];

describe('getRedisModulesSummary', () => {
  test.each(getRedisModulesSummaryTests)('%j', ({ input, expected }) => {
    // @ts-ignore
    const result = getRedisModulesSummary(input);
    expect(result).toEqual(expected);
  });
});
