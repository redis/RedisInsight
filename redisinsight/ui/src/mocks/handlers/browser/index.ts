import { DefaultBodyType, MockedRequest, RestHandler } from 'msw'

import redisearch from './redisearchHandlers'
import bulkActions from './bulkActionsHandlers'

const handlers: RestHandler<MockedRequest<DefaultBodyType>>[] = [].concat(
  redisearch,
  bulkActions,
)
export default handlers
