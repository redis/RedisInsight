import { http, HttpHandler, HttpResponse } from 'msw'
import { ApiEndpoints } from 'uiSrc/constants'
import { getMswURL } from 'uiSrc/utils/test-utils'

const handlers: HttpHandler[] = [
  http.post(getMswURL(ApiEndpoints.CUSTOM_TUTORIALS), () => {
    return HttpResponse.json({
      id: 'f79e82e8-c34a-4dc7-a49e-9fadc0979fda',
    })
  }),
]

export default handlers
