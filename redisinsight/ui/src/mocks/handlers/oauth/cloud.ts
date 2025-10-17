import { http, HttpHandler, HttpResponse } from 'msw'
import { getMswURL } from 'uiSrc/utils/test-utils'
import { ApiEndpoints } from 'uiSrc/constants'
import { OAUTH_CLOUD_CAPI_KEYS_DATA } from 'uiSrc/mocks/data/oauth'

export const CLOUD_ME_DATA_MOCK = {
  id: 66830,
  name: 'John Smith',
  currentAccountId: 71011,
  accounts: [
    {
      id: 71011,
      name: 'Test account',
    },
  ],
  data: {},
}

const handlers: HttpHandler[] = [
  // fetch cloud capi keys
  http.get(getMswURL(ApiEndpoints.CLOUD_CAPI_KEYS), async () => {
    return HttpResponse.json(OAUTH_CLOUD_CAPI_KEYS_DATA, { status: 200 })
  }),

  // fetch user profile
  http.get(getMswURL(ApiEndpoints.CLOUD_ME), async () => {
    return HttpResponse.json(CLOUD_ME_DATA_MOCK, { status: 200 })
  }),
]

export default handlers
