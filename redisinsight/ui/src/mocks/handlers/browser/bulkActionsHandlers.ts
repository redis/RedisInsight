import { rest, RestHandler } from 'msw'
import { ApiEndpoints } from 'uiSrc/constants'
import { getMswURL } from 'uiSrc/utils/test-utils'
import { getUrl } from 'uiSrc/utils'
import { IBulkActionOverview } from 'uiSrc/slices/interfaces'
import { bulkActionOverviewFactory } from 'uiSrc/mocks/factories/browser/bulkActions/bulkActionOverview.factory'
import { INSTANCE_ID_MOCK } from '../instances/instancesHandlers'

const handlers: RestHandler[] = [
  rest.post<IBulkActionOverview>(
    getMswURL(
      getUrl(
        INSTANCE_ID_MOCK,
        ApiEndpoints.BULK_ACTIONS_IMPORT_VECTOR_COLLECTION,
      ),
    ),
    async (_req, res, ctx) =>
      res(ctx.status(200), ctx.json(bulkActionOverviewFactory.build())),
  ),
]

export default handlers
