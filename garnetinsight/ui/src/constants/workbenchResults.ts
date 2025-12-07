import { RedisDefaultModules } from 'uiSrc/slices/interfaces'
import { EXTERNAL_LINKS } from './links'

export const bulkReplyCommands = [
  'LOLWUT',
  'INFO',
  'CLIENT',
  'CLUSTER',
  'MEMORY',
  'MONITOR',
  'PSUBSCRIBE',
]

export const EMPTY_COMMAND = 'Encrypted data'

export const MODULE_NOT_LOADED_CONTENT: { [key in RedisDefaultModules]?: any } =
  {
    [RedisDefaultModules.TimeSeries]: {
      text: ['Time series data structure adds the capability to:'],
      improvements: [
        'Add sample data',
        'Perform cross-time-series range and aggregation queries',
        'Define compaction rules for economical retention of historical data',
      ],
      link: 'https://redis.io/docs/latest/develop/data-types/timeseries/',
    },
    [RedisDefaultModules.Search]: {
      text: ['Redis Query Engine allows to:'],
      improvements: ['Query', 'Secondary index', 'Full-text search'],
      additionalText: [
        'These features enable multi-field queries, aggregation, exact phrase matching, numeric filtering, ',
        'geo filtering and vector similarity semantic search on top of text queries.',
      ],
      link: EXTERNAL_LINKS.redisQueryEngine,
    },
    [RedisDefaultModules.ReJSON]: {
      text: ['JSON adds the capability to:'],
      improvements: [
        'Store JSON documents',
        'Update JSON documents',
        'Retrieve JSON documents',
      ],
      additionalText: [
        'JSON data structure also works seamlessly with Redis Query Engine to let you index and query JSON documents.',
      ],
      link: 'https://redis.io/docs/latest/develop/data-types/json/',
    },
    [RedisDefaultModules.Bloom]: {
      text: ['Probabilistic data structures include:'],
      improvements: [
        'Bloom filter',
        'Cuckoo filter',
        'Count-min sketch',
        'Top-K',
        'T-digest',
      ],
      additionalText: [
        'With these data structures, you can query streaming data without needing to store all the elements of the stream.',
      ],
      link: 'https://redis.io/docs/latest/develop/data-types/probabilistic/bloom-filter/',
    },
  }

export const MODULE_TEXT_VIEW: { [key in RedisDefaultModules]?: string } = {
  [RedisDefaultModules.Bloom]: 'probabilistic data structures',
  [RedisDefaultModules.ReJSON]: 'JSON data structure',
  [RedisDefaultModules.Search]: 'Redis Query Engine',
  [RedisDefaultModules.TimeSeries]: 'time series data structure',
}
