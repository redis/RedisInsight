import { HttpHandler } from 'msw'

import redisearch from './redisearchHandlers'
import bulkActions from './bulkActionsHandlers'

const handlers: HttpHandler[] = [...redisearch, ...bulkActions]
export default handlers
