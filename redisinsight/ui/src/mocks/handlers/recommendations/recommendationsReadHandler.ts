import { http, HttpHandler, HttpResponse } from 'msw'
import { ApiEndpoints } from 'uiSrc/constants'
import { getMswURL } from 'uiSrc/utils/test-utils'
import { getUrl } from 'uiSrc/utils'
import { DatabaseRecommendation as RecommendationResponse } from 'apiSrc/modules/database-recommendation/models/database-recommendation'
import { INSTANCE_ID_MOCK } from '../instances/instancesHandlers'

const EMPTY_RECOMMENDATIONS_MOCK = {
  recommendations: [],
  totalUnread: 0,
}

const handlers: HttpHandler[] = [
  // readRecommendationsAction
  http.patch<any, RecommendationResponse>(
    getMswURL(getUrl(INSTANCE_ID_MOCK, ApiEndpoints.RECOMMENDATIONS_READ)),
    async () => {
      HttpResponse.json(EMPTY_RECOMMENDATIONS_MOCK, { status: 200 })
    },
  ),
]

export default handlers
