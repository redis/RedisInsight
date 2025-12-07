import { http, HttpHandler, HttpResponse } from 'msw'
import { ApiEndpoints } from 'uiSrc/constants'
import { getMswURL } from 'uiSrc/utils/test-utils'

const handlers: HttpHandler[] = [
  // sendEventTelemetry
  http.post(getMswURL(ApiEndpoints.ANALYTICS_SEND_EVENT), async () => {
    return HttpResponse.text('', { status: 200 })
  }),
  // sendPageViewTelemetry
  http.post(getMswURL(ApiEndpoints.ANALYTICS_SEND_PAGE), async () => {
    return HttpResponse.text('', { status: 200 })
  }),
]

export default handlers
