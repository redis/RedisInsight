import { http, HttpHandler, HttpResponse } from 'msw'
import { ApiEndpoints } from 'uiSrc/constants'
import { getMswURL } from 'uiSrc/utils/test-utils'
import { getUrl } from 'uiSrc/utils'
import { queryLibraryItemFactory } from 'uiSrc/mocks/factories/query-library/queryLibraryItem.factory'
import { INSTANCE_ID_MOCK } from '../instances/instancesHandlers'

export const QUERY_LIBRARY_ITEMS_MOCK = queryLibraryItemFactory.buildList(2, {
  databaseId: INSTANCE_ID_MOCK,
})

const handlers: HttpHandler[] = [
  http.get(
    getMswURL(getUrl(INSTANCE_ID_MOCK, ApiEndpoints.QUERY_LIBRARY)),
    async () => HttpResponse.json(QUERY_LIBRARY_ITEMS_MOCK, { status: 200 }),
  ),
  http.delete(
    getMswURL(getUrl(INSTANCE_ID_MOCK, ApiEndpoints.QUERY_LIBRARY, ':id')),
    async () => HttpResponse.text('', { status: 200 }),
  ),
  http.post(
    getMswURL(getUrl(INSTANCE_ID_MOCK, ApiEndpoints.QUERY_LIBRARY_SEED)),
    async () => HttpResponse.json([], { status: 200 }),
  ),
]

export default handlers
