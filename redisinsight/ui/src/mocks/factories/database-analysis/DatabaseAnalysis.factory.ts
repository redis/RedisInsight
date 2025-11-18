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
