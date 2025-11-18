import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { DatabaseAnalysis } from 'apiSrc/modules/database-analysis/models'

export const DatabaseAnalysisFactory = Factory.define<DatabaseAnalysis>(() => ({
  id: faker.string.uuid(),
  databaseId: faker.string.uuid(),
  filter: { match: '*', count: 10000 } as any,
  delimiter: ':',
  progress: { total: 100000, scanned: 50000, processed: 10000 } as any,
  createdAt: faker.date.recent(),
  totalKeys: { total: 10000, types: [] } as any,
  totalMemory: { total: 1000000, types: [] } as any,
  topKeysNsp: [],
  topMemoryNsp: [],
  topKeysLength: [],
  topKeysMemory: [],
  expirationGroups: [],
  recommendations: [],
}))

export const buildDatabaseAnalysisWithTopKeys = () => {
  const data = DatabaseAnalysisFactory.build({
    totalKeys: {
      total: 7_500,
      types: [
        { type: 'string', total: 3_000 },
        { type: 'hash', total: 2_500 },
        { type: 'zset', total: 2_000 },
      ],
    } as any,
    totalMemory: {
      total: 450_000,
      types: [
        { type: 'string', total: 50_000 },
        { type: 'hash', total: 250_000 },
        { type: 'zset', total: 150_000 },
      ],
    } as any,
    topKeysLength: [
      {
        name: 'user:sessions',
        type: 'hash',
        memory: 120_000,
        length: 5_000,
        ttl: -1,
      },
      {
        name: 'orders:recent',
        type: 'list',
        memory: 80_000,
        length: 2_000,
        ttl: 3_600,
      },
    ] as any,
    topKeysMemory: [
      {
        name: 'user:sessions',
        type: 'hash',
        memory: 120_000,
        length: 5_000,
        ttl: -1,
      },
      {
        name: 'metrics:pageviews',
        type: 'zset',
        memory: 200_000,
        length: 1_000,
        ttl: -1,
      },
    ] as any,
    expirationGroups: [
      { label: 'No expiry', total: 8_000, threshold: 0 },
      { label: '<1 hr', total: 1_500, threshold: 3_600 },
      { label: '1–24 hrs', total: 500, threshold: 86_400 },
    ] as any,
  })

  const reports = [
    {
      id: data.id,
      createdAt: data.createdAt,
      db: data.db,
    },
  ]

  return { data, reports }
}

export const buildDatabaseAnalysisWithNamespaces = () =>
  DatabaseAnalysisFactory.build({
    topMemoryNsp: [
      {
        nsp: 'users',
        memory: 500000,
        keys: 1200,
        types: [
          {
            type: 'hash',
            memory: 400000,
            keys: 800,
          },
          {
            type: 'string',
            memory: 100000,
            keys: 400,
          },
        ],
      },
      {
        nsp: 'orders',
        memory: 300000,
        keys: 600,
        types: [
          {
            type: 'zset',
            memory: 200000,
            keys: 300,
          },
          {
            type: 'list',
            memory: 100000,
            keys: 300,
          },
        ],
      },
    ] as any,
    topKeysNsp: [
      {
        nsp: 'users',
        memory: 500000,
        keys: 1200,
        types: [
          {
            type: 'hash',
            memory: 400000,
            keys: 800,
          },
          {
            type: 'string',
            memory: 100000,
            keys: 400,
          },
        ],
      },
      {
        nsp: 'orders',
        memory: 300000,
        keys: 600,
        types: [
          {
            type: 'zset',
            memory: 200000,
            keys: 300,
          },
          {
            type: 'list',
            memory: 100000,
            keys: 300,
          },
        ],
      },
    ] as any,
    delimiter: ':',
  })


