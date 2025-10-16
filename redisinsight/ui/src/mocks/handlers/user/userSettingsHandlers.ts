import { http, HttpHandler, HttpResponse } from 'msw'
import { ApiEndpoints } from 'uiSrc/constants'
import { getMswURL } from 'uiSrc/utils/test-utils'

export const USER_SETTINGS_DATA_MOCK = {
  theme: 'DARK',
  dateFormat: 'YYYY-MM-DD',
  timezone: 'UTC',
  batchSize: 5,
  scanThreshold: 10_000,
  agreements: {
    eula: true,
    analytics: true,
    notifications: true,
    version: '1.0.0',
  },
}

const handlers: HttpHandler[] = [
  http.get(getMswURL(ApiEndpoints.SETTINGS), async () => {
    HttpResponse.json(USER_SETTINGS_DATA_MOCK, { status: 200 })
  }),
]

export default handlers
