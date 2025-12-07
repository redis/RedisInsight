import { http, HttpHandler, HttpResponse } from 'msw'
import { ApiEndpoints } from 'uiSrc/constants'
import { getUrl } from 'uiSrc/utils'
import { getMswURL } from 'uiSrc/utils/test-utils'

export const INSTANCE_ID_MOCK = 'instanceId'

const handlers: HttpHandler[] = [
  // fetchDBAnalysisReportsHistory
  http.get(
    getMswURL(getUrl(INSTANCE_ID_MOCK, ApiEndpoints.DATABASE_ANALYSIS)),
    async () => {
      return HttpResponse.json(DB_ANALYSIS_HISTORY_DATA_MOCK, { status: 200 })
    },
  ),
  http.post(
    getMswURL(getUrl(INSTANCE_ID_MOCK, ApiEndpoints.DATABASE_ANALYSIS)),
    async () => {
      return HttpResponse.json({}, { status: 200 })
    },
  ),
]

export const DB_ANALYSIS_HISTORY_DATA_MOCK = [
  { id: 'id_1', createdAt: '1', db: 0 },
  { id: 'id_2', createdAt: '2', db: 0 },
]

export default handlers
