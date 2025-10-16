import { http, HttpHandler, HttpResponse } from 'msw'
import { ApiEndpoints } from 'uiSrc/constants'
import { getMswURL } from 'uiSrc/utils/test-utils'
import { getUrl } from 'uiSrc/utils'
import { DatabaseRecommendationsResponse as RecommendationResponse } from 'apiSrc/modules/database-recommendation/dto/database-recommendations.response'
import { INSTANCE_ID_MOCK } from '../instances/instancesHandlers'

export const RECOMMENDATIONS_DATA_MOCK = {
  recommendations: [
    { name: 'redisSearch', id: 'id', read: false, hide: false },
    { name: 'bigHashes', id: 'id2', read: false, hide: true },
  ],
  totalUnread: 1,
}

const handlers: HttpHandler[] = [
  // fetchRecommendationsAction
  http.get<any, RecommendationResponse>(
    getMswURL(getUrl(INSTANCE_ID_MOCK, ApiEndpoints.RECOMMENDATIONS)),
    async () => {
      HttpResponse.json(RECOMMENDATIONS_DATA_MOCK, { status: 200 })
    },
  ),
  http.delete(
    getMswURL(getUrl(INSTANCE_ID_MOCK, ApiEndpoints.RECOMMENDATIONS)),
    async () => {
      HttpResponse.text({ status: 200 })
    },
  ),
]

export default handlers
