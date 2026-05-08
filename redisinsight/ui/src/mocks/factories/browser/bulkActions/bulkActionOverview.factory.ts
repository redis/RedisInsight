import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import {
  BulkActionsStatus,
  BulkActionsType,
  RedisDataType,
} from 'uiSrc/constants'
import {
  IBulkActionFilterOverview,
  IBulkActionOverview,
  IBulkActionProgressOverview,
  IBulkActionSummaryOverview,
} from 'uiSrc/slices/interfaces'

export const bulkActionOverviewFactory = Factory.define<IBulkActionOverview>(
  ({ sequence }) => ({
    id: `bulk-action-${sequence}`,
    databaseId: faker.string.uuid(),
    type: faker.helpers.enumValue(BulkActionsType),
    summary: bulkActionSummaryOverviewFactory.build(),
    progress: bulkActionProgressOverviewFactory.build(),
    filter: bulkActionFilterOverviewFactory.build(),
    status: faker.helpers.enumValue(BulkActionsStatus),
    duration: faker.number.int({ min: 10, max: 100 }),
  }),
)

export const bulkActionSummaryOverviewFactory =
  Factory.define<IBulkActionSummaryOverview>(() => ({
    processed: faker.number.int({ min: 200, max: 299 }),
    succeed: faker.number.int({ min: 300, max: 399 }),
    failed: faker.number.int({ min: 400, max: 499 }),
    errors: [],
    keys: [],
  }))

export const bulkActionProgressOverviewFactory =
  Factory.define<IBulkActionProgressOverview>(() => ({
    total: faker.number.int({ min: 100, max: 1000 }),
    scanned: faker.number.int({ min: 0, max: 1000 }),
  }))

export const bulkActionFilterOverviewFactory =
  Factory.define<IBulkActionFilterOverview>(() => ({
    type: faker.helpers.enumValue(RedisDataType),
    match: faker.string.uuid(),
  }))
