import { HttpHandler } from 'msw'

import redisearch from './redisearchHandlers'
import bulkActions from './bulkActionsHandlers'
import queryLibrary from './queryLibraryHandlers'

const handlers: HttpHandler[] = [...redisearch, ...bulkActions, ...queryLibrary]
export default handlers
