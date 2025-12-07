export const MOCK_ANALYSIS_REPORT_DATA = {
  id: '1',
  databaseId: 'id',
  filter: {
    type: null,
    match: '*',
    count: 10000,
  },
  delimiter: ':',
  progress: {
    total: 77,
    scanned: 10000,
    processed: 77,
  },
  createdAt: '2022-10-06T13:09:35.000Z',
  totalKeys: {
    total: 77,
    types: [
      {
        type: 'hash',
        total: 19,
      },
      {
        type: 'TSDB-TYPE',
        total: 11,
      },
      {
        type: 'string',
        total: 11,
      },
      {
        type: 'list',
        total: 9,
      },
      {
        type: 'stream',
        total: 8,
      },
      {
        type: 'zset',
        total: 8,
      },
      {
        type: 'set',
        total: 7,
      },
      {
        type: 'graphdata',
        total: 2,
      },
      {
        type: 'ReJSON-RL',
        total: 1,
      },
      {
        type: 'MBbloom--',
        total: 1,
      },
    ],
  },
  totalMemory: {
    total: 11911834,
    types: [
      {
        type: 'hash',
        total: 11316165,
      },
      {
        type: 'zset',
        total: 233571,
      },
      {
        type: 'set',
        total: 138184,
      },
      {
        type: 'list',
        total: 95886,
      },
      {
        type: 'stream',
        total: 79532,
      },
      {
        type: 'TSDB-TYPE',
        total: 47143,
      },
      {
        type: 'string',
        total: 941,
      },
      {
        type: 'MBbloom--',
        total: 280,
      },
      {
        type: 'graphdata',
        total: 72,
      },
      {
        type: 'ReJSON-RL',
        total: 60,
      },
    ],
  },
  topKeysNsp: [
    {
      nsp: 'ASCII',
      memory: 533642,
      keys: 6,
      types: [
        {
          type: 'hash',
          memory: 266544,
          keys: 1,
        },
        {
          type: 'zset',
          memory: 118784,
          keys: 1,
        },
        {
          type: 'set',
          memory: 72352,
          keys: 1,
        },
        {
          type: 'stream',
          memory: 43337,
          keys: 1,
        },
        {
          type: 'list',
          memory: 32549,
          keys: 1,
        },
        {
          type: 'string',
          memory: 76,
          keys: 1,
        },
      ],
    },
    {
      nsp: 'Unicode',
      memory: 490400,
      keys: 6,
      types: [
        {
          type: 'string',
          memory: 64,
          keys: 1,
        },
        {
          type: 'hash',
          memory: 257112,
          keys: 1,
        },
        {
          type: 'set',
          memory: 64360,
          keys: 1,
        },
        {
          type: 'zset',
          memory: 111008,
          keys: 1,
        },
        {
          type: 'stream',
          memory: 31312,
          keys: 1,
        },
        {
          type: 'list',
          memory: 26544,
          keys: 1,
        },
      ],
    },
    {
      nsp: 'Proto',
      memory: 2275,
      keys: 6,
      types: [
        {
          type: 'stream',
          memory: 1045,
          keys: 1,
        },
        {
          type: 'list',
          memory: 248,
          keys: 1,
        },
        {
          type: 'string',
          memory: 93,
          keys: 1,
        },
        {
          type: 'set',
          memory: 312,
          keys: 1,
        },
        {
          type: 'zset',
          memory: 143,
          keys: 1,
        },
        {
          type: 'hash',
          memory: 434,
          keys: 1,
        },
      ],
    },
    {
      nsp: 'Pickle',
      memory: 3494,
      keys: 6,
      types: [
        {
          type: 'hash',
          memory: 560,
          keys: 1,
        },
        {
          type: 'zset',
          memory: 1144,
          keys: 1,
        },
        {
          type: 'stream',
          memory: 849,
          keys: 1,
        },
        {
          type: 'list',
          memory: 413,
          keys: 1,
        },
        {
          type: 'string',
          memory: 152,
          keys: 1,
        },
        {
          type: 'set',
          memory: 376,
          keys: 1,
        },
      ],
    },
    {
      nsp: 'PHP',
      memory: 3096,
      keys: 6,
      types: [
        {
          type: 'zset',
          memory: 1032,
          keys: 1,
        },
        {
          type: 'list',
          memory: 215,
          keys: 1,
        },
        {
          type: 'string',
          memory: 136,
          keys: 1,
        },
        {
          type: 'set',
          memory: 288,
          keys: 1,
        },
        {
          type: 'stream',
          memory: 889,
          keys: 1,
        },
        {
          type: 'hash',
          memory: 536,
          keys: 1,
        },
      ],
    },
    {
      nsp: 'Msgpack',
      memory: 1752,
      keys: 6,
      types: [
        {
          type: 'set',
          memory: 264,
          keys: 1,
        },
        {
          type: 'string',
          memory: 112,
          keys: 1,
        },
        {
          type: 'list',
          memory: 203,
          keys: 1,
        },
        {
          type: 'stream',
          memory: 839,
          keys: 1,
        },
        {
          type: 'zset',
          memory: 121,
          keys: 1,
        },
        {
          type: 'hash',
          memory: 213,
          keys: 1,
        },
      ],
    },
    {
      nsp: 'JSON',
      memory: 2437,
      keys: 6,
      types: [
        {
          type: 'list',
          memory: 156,
          keys: 1,
        },
        {
          type: 'set',
          memory: 232,
          keys: 1,
        },
        {
          type: 'string',
          memory: 73,
          keys: 1,
        },
        {
          type: 'stream',
          memory: 653,
          keys: 1,
        },
        {
          type: 'hash',
          memory: 1240,
          keys: 1,
        },
        {
          type: 'zset',
          memory: 83,
          keys: 1,
        },
      ],
    },
    {
      nsp: 'school',
      memory: 3528,
      keys: 4,
      types: [
        {
          type: 'hash',
          memory: 3528,
          keys: 4,
        },
      ],
    },
    {
      nsp: 'animals',
      memory: 318,
      keys: 3,
      types: [
        {
          type: 'hash',
          memory: 318,
          keys: 3,
        },
      ],
    },
    {
      nsp: 'Java',
      memory: 1592,
      keys: 2,
      types: [
        {
          type: 'list',
          memory: 336,
          keys: 1,
        },
        {
          type: 'zset',
          memory: 1256,
          keys: 1,
        },
      ],
    },
    {
      nsp: 'Test',
      memory: 60,
      keys: 1,
      types: [
        {
          type: 'ReJSON-RL',
          memory: 60,
          keys: 1,
        },
      ],
    },
  ],
  topMemoryNsp: [
    {
      nsp: 'ASCII',
      memory: 533642,
      keys: 6,
      types: [
        {
          type: 'hash',
          memory: 266544,
          keys: 1,
        },
        {
          type: 'zset',
          memory: 118784,
          keys: 1,
        },
        {
          type: 'set',
          memory: 72352,
          keys: 1,
        },
        {
          type: 'stream',
          memory: 43337,
          keys: 1,
        },
        {
          type: 'list',
          memory: 32549,
          keys: 1,
        },
        {
          type: 'string',
          memory: 76,
          keys: 1,
        },
      ],
    },
    {
      nsp: 'Unicode',
      memory: 490400,
      keys: 6,
      types: [
        {
          type: 'hash',
          memory: 257112,
          keys: 1,
        },
        {
          type: 'zset',
          memory: 111008,
          keys: 1,
        },
        {
          type: 'set',
          memory: 64360,
          keys: 1,
        },
        {
          type: 'stream',
          memory: 31312,
          keys: 1,
        },
        {
          type: 'list',
          memory: 26544,
          keys: 1,
        },
        {
          type: 'string',
          memory: 64,
          keys: 1,
        },
      ],
    },
    {
      nsp: 'school',
      memory: 3528,
      keys: 4,
      types: [
        {
          type: 'hash',
          memory: 3528,
          keys: 4,
        },
      ],
    },
    {
      nsp: 'Pickle',
      memory: 3494,
      keys: 6,
      types: [
        {
          type: 'zset',
          memory: 1144,
          keys: 1,
        },
        {
          type: 'stream',
          memory: 849,
          keys: 1,
        },
        {
          type: 'hash',
          memory: 560,
          keys: 1,
        },
        {
          type: 'list',
          memory: 413,
          keys: 1,
        },
        {
          type: 'set',
          memory: 376,
          keys: 1,
        },
        {
          type: 'string',
          memory: 152,
          keys: 1,
        },
      ],
    },
    {
      nsp: 'PHP',
      memory: 3096,
      keys: 6,
      types: [
        {
          type: 'zset',
          memory: 1032,
          keys: 1,
        },
        {
          type: 'stream',
          memory: 889,
          keys: 1,
        },
        {
          type: 'hash',
          memory: 536,
          keys: 1,
        },
        {
          type: 'set',
          memory: 288,
          keys: 1,
        },
        {
          type: 'list',
          memory: 215,
          keys: 1,
        },
        {
          type: 'string',
          memory: 136,
          keys: 1,
        },
      ],
    },
    {
      nsp: 'JSON',
      memory: 2437,
      keys: 6,
      types: [
        {
          type: 'hash',
          memory: 1240,
          keys: 1,
        },
        {
          type: 'stream',
          memory: 653,
          keys: 1,
        },
        {
          type: 'set',
          memory: 232,
          keys: 1,
        },
        {
          type: 'list',
          memory: 156,
          keys: 1,
        },
        {
          type: 'zset',
          memory: 83,
          keys: 1,
        },
        {
          type: 'string',
          memory: 73,
          keys: 1,
        },
      ],
    },
    {
      nsp: 'Proto',
      memory: 2275,
      keys: 6,
      types: [
        {
          type: 'stream',
          memory: 1045,
          keys: 1,
        },
        {
          type: 'hash',
          memory: 434,
          keys: 1,
        },
        {
          type: 'set',
          memory: 312,
          keys: 1,
        },
        {
          type: 'list',
          memory: 248,
          keys: 1,
        },
        {
          type: 'zset',
          memory: 143,
          keys: 1,
        },
        {
          type: 'string',
          memory: 93,
          keys: 1,
        },
      ],
    },
    {
      nsp: 'Msgpack',
      memory: 1752,
      keys: 6,
      types: [
        {
          type: 'stream',
          memory: 839,
          keys: 1,
        },
        {
          type: 'set',
          memory: 264,
          keys: 1,
        },
        {
          type: 'hash',
          memory: 213,
          keys: 1,
        },
        {
          type: 'list',
          memory: 203,
          keys: 1,
        },
        {
          type: 'zset',
          memory: 121,
          keys: 1,
        },
        {
          type: 'string',
          memory: 112,
          keys: 1,
        },
      ],
    },
    {
      nsp: 'Java',
      memory: 1592,
      keys: 2,
      types: [
        {
          type: 'zset',
          memory: 1256,
          keys: 1,
        },
        {
          type: 'list',
          memory: 336,
          keys: 1,
        },
      ],
    },
    {
      nsp: 'animals',
      memory: 318,
      keys: 3,
      types: [
        {
          type: 'hash',
          memory: 318,
          keys: 3,
        },
      ],
    },
    {
      nsp: 'Test',
      memory: 60,
      keys: 1,
      types: [
        {
          type: 'ReJSON-RL',
          memory: 60,
          keys: 1,
        },
      ],
    },
  ],
  topKeysLength: [
    {
      name: 'hugeHash',
      type: 'hash',
      memory: 10743352,
      length: 40000,
      ttl: -1,
    },
    {
      name: 'ASCII:list',
      type: 'list',
      memory: 32549,
      length: 1001,
      ttl: -1,
    },
    {
      name: 'Unicode:list',
      type: 'list',
      memory: 26544,
      length: 1000,
      ttl: -1,
    },
    {
      name: 'Unicode:stream',
      type: 'stream',
      memory: 31312,
      length: 1000,
      ttl: -1,
    },
    {
      name: 'Unicode:zset',
      type: 'zset',
      memory: 111008,
      length: 1000,
      ttl: -1,
    },
    {
      name: 'Unicode:set',
      type: 'set',
      memory: 64360,
      length: 1000,
      ttl: -1,
    },
    {
      name: 'ASCII:stream',
      type: 'stream',
      memory: 43337,
      length: 1000,
      ttl: -1,
    },
    {
      name: 'ASCII:set',
      type: 'set',
      memory: 72352,
      length: 1000,
      ttl: -1,
    },
    {
      name: 'ASCII:zset',
      type: 'zset',
      memory: 118784,
      length: 1000,
      ttl: -1,
    },
    {
      name: 'ASCII:hash',
      type: 'hash',
      memory: 266544,
      length: 1000,
      ttl: -1,
    },
    {
      name: 'Unicode:hash',
      type: 'hash',
      memory: 257112,
      length: 1000,
      ttl: -1,
    },
    {
      name: 'Pickle:string',
      type: 'string',
      memory: 152,
      length: 88,
      ttl: -1,
    },
    {
      name: 'PHP:string',
      type: 'string',
      memory: 136,
      length: 74,
      ttl: -1,
    },
    {
      name: 'Msgpack:string',
      type: 'string',
      memory: 112,
      length: 50,
      ttl: -1,
    },
    {
      name: 'Proto:string',
      type: 'string',
      memory: 93,
      length: 35,
      ttl: -1,
    },
  ],
  topKeysMemory: [
    {
      name: 'hugeHash',
      type: 'hash',
      memory: 10743352,
      length: 40000,
      ttl: -1,
    },
    {
      name: 'ASCII:hash',
      type: 'hash',
      memory: 266544,
      length: 1000,
      ttl: -1,
    },
    {
      name: 'Unicode:hash',
      type: 'hash',
      memory: 257112,
      length: 1000,
      ttl: -1,
    },
    {
      name: 'ASCII:zset',
      type: 'zset',
      memory: 118784,
      length: 1000,
      ttl: -1,
    },
    {
      name: 'Unicode:zset',
      type: 'zset',
      memory: 111008,
      length: 1000,
      ttl: -1,
    },
    {
      name: 'ASCII:set',
      type: 'set',
      memory: 72352,
      length: 1000,
      ttl: -1,
    },
    {
      name: 'Unicode:set',
      type: 'set',
      memory: 64360,
      length: 1000,
      ttl: -1,
    },
    {
      name: 'ASCII:stream',
      type: 'stream',
      memory: 43337,
      length: 1000,
      ttl: -1,
    },
    {
      name: 'vdasd',
      type: 'hash',
      memory: 41168,
      length: 1,
      ttl: -1,
    },
    {
      name: 'List',
      type: 'list',
      memory: 35222,
      length: 16,
      ttl: -1,
    },
    {
      name: 'ASCII:list',
      type: 'list',
      memory: 32549,
      length: 1001,
      ttl: -1,
    },
    {
      name: 'Unicode:stream',
      type: 'stream',
      memory: 31312,
      length: 1000,
      ttl: -1,
    },
    {
      name: 'Unicode:list',
      type: 'list',
      memory: 26544,
      length: 1000,
      ttl: -1,
    },
    {
      name: 'bike_sales_3',
      type: 'TSDB-TYPE',
      memory: 4337,
      length: 21,
      ttl: -1,
    },
    {
      name: 'vd_bike_sales_5_per_day1',
      type: 'TSDB-TYPE',
      memory: 4298,
      length: 0,
      ttl: -1,
    },
  ],
  expirationGroups: [
    {
      label: 'No expiry',
      total: 11911834,
      threshold: 0,
    },
    {
      label: '<1 hr',
      total: 5345345,
      threshold: 3600,
    },
    {
      label: '1-4 Hrs',
      total: 0,
      threshold: 144000,
    },
    {
      label: '4-12 Hrs',
      total: 0,
      threshold: 432000,
    },
    {
      label: '12-24 Hrs',
      total: 0,
      threshold: 864000,
    },
    {
      label: '1-7 Days',
      total: 0,
      threshold: 6048000,
    },
    {
      label: '>7 Days',
      total: 0,
      threshold: 25920000,
    },
    {
      label: '>1 Month',
      total: 0,
      threshold: 9007199254740991,
    },
  ],
}
