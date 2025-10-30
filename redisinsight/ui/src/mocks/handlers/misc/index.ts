import { getMswURL } from 'uiSrc/utils/test-utils'
import { ApiEndpoints } from 'uiSrc/constants'
import { http, HttpHandler, HttpResponse } from 'msw'
import { USER_SETTINGS_DATA_MOCK } from 'uiSrc/mocks/handlers/user/userSettingsHandlers'

const apiSettings = getMswURL(ApiEndpoints.SETTINGS)

export const handlers: HttpHandler[] = [
  http.get(apiSettings, async () => {
    return HttpResponse.json(USER_SETTINGS_DATA_MOCK, { status: 200 })
  }),
  http.patch(apiSettings, async () => {
    return HttpResponse.json(USER_SETTINGS_DATA_MOCK, { status: 200 })
  }),
]
