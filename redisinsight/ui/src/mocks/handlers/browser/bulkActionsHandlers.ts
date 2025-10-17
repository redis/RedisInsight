import { http, HttpHandler, HttpResponse } from 'msw'
import { ApiEndpoints } from 'uiSrc/constants'
import { getMswURL } from 'uiSrc/utils/test-utils'
import { getUrl } from 'uiSrc/utils'
import { IBulkActionOverview } from 'uiSrc/slices/interfaces'
import { bulkActionOverviewFactory } from 'uiSrc/mocks/factories/browser/bulkActions/bulkActionOverview.factory'
import { INSTANCE_ID_MOCK } from '../instances/instancesHandlers'

const handlers: HttpHandler[] = [
  http.post<any, IBulkActionOverview>(
    getMswURL(
      getUrl(
        INSTANCE_ID_MOCK,
        ApiEndpoints.BULK_ACTIONS_IMPORT_VECTOR_COLLECTION,
      ),
    ),
    async () => {
      return HttpResponse.json(bulkActionOverviewFactory.build(), {
        status: 200,
      })
    },
  ),
]

export default handlers
