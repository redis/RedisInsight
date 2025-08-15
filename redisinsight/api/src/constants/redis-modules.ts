export enum AdditionalRedisModuleName {
  RedisAI = 'ai',
  RedisGraph = 'graph',
  RedisGears = 'rg',
  RedisBloom = 'bf',
  RedisJSON = 'ReJSON',
  RediSearch = 'search',
  RedisTimeSeries = 'timeseries',
}

export enum AdditionalSearchModuleName {
  SearchLight = 'searchlight',
  FT = 'ft',
  FTL = 'ftl',
}

export const SUPPORTED_REDIS_MODULES = Object.freeze({
  ai: AdditionalRedisModuleName.RedisAI,
  graph: AdditionalRedisModuleName.RedisGraph,
  rg: AdditionalRedisModuleName.RedisGears,
  bf: AdditionalRedisModuleName.RedisBloom,
  ReJSON: AdditionalRedisModuleName.RedisJSON,
  search: AdditionalRedisModuleName.RediSearch,
  timeseries: AdditionalRedisModuleName.RedisTimeSeries,
});

export const REDIS_CLOUD_MODULES_NAMES = Object.freeze({
  RedisAI: AdditionalRedisModuleName.RedisAI,
  RedisGraph: AdditionalRedisModuleName.RedisGraph,
  RedisGears: AdditionalRedisModuleName.RedisGears,
  RedisBloom: AdditionalRedisModuleName.RedisBloom,
  RedisJSON: AdditionalRedisModuleName.RedisJSON,
  RediSearch: AdditionalRedisModuleName.RediSearch,
  RedisTimeSeries: AdditionalRedisModuleName.RedisTimeSeries,
});

export const REDIS_SOFTWARE_MODULES_NAMES = Object.freeze({
  ai: AdditionalRedisModuleName.RedisAI,
  graph: AdditionalRedisModuleName.RedisGraph,
  gears: AdditionalRedisModuleName.RedisGears,
  bf: AdditionalRedisModuleName.RedisBloom,
  ReJSON: AdditionalRedisModuleName.RedisJSON,
  search: AdditionalRedisModuleName.RediSearch,
  timeseries: AdditionalRedisModuleName.RedisTimeSeries,
});

export const REDIS_MODULES_COMMANDS = new Map([
  [AdditionalRedisModuleName.RedisAI, ['ai.info']],
  [AdditionalRedisModuleName.RedisGraph, ['graph.delete']],
  [AdditionalRedisModuleName.RedisGears, ['rg.pyexecute']],
  [
    AdditionalRedisModuleName.RedisBloom,
    ['bf.info', 'cf.info', 'cms.info', 'topk.info'],
  ],
  [AdditionalRedisModuleName.RedisJSON, ['json.get']],
  [AdditionalRedisModuleName.RediSearch, ['ft.info']],
  [AdditionalRedisModuleName.RedisTimeSeries, ['ts.mrange', 'ts.info']],
]);

export const REDISEARCH_MODULES: string[] = [
  AdditionalRedisModuleName.RediSearch,
  AdditionalSearchModuleName.SearchLight,
  AdditionalSearchModuleName.FT,
  AdditionalSearchModuleName.FTL,
];
