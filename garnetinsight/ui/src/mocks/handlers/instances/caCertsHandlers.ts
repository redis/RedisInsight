import { http, HttpHandler, HttpResponse } from 'msw'
import { ApiEndpoints } from 'uiSrc/constants'
import { getMswURL } from 'uiSrc/utils/test-utils'

interface CaCertRequestBody {
  username: string
}

const handlers: HttpHandler[] = [
  http.post<any, CaCertRequestBody>(
    getMswURL(ApiEndpoints.CA_CERTIFICATES),
    async ({ request }) => {
      const { username } = await request.clone().json()

      return HttpResponse.json({
        id: 'f79e82e8-c34a-4dc7-a49e-9fadc0979fda',
        username,
        firstName: 'John',
        lastName: 'Maverick',
      })
    },
  ),
]

export default handlers
