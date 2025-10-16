import { http, HttpHandler, HttpResponse } from 'msw'
import { getMswURL } from 'uiSrc/utils/test-utils'
import { getUrl } from 'uiSrc/utils'
import { ApiEndpoints } from 'uiSrc/constants'
import { Rdi as RdiInstanceResponse } from 'apiSrc/modules/rdi/models/rdi'

const handlers: HttpHandler[] = [
  // fetch rdi instances
  http.get<any, RdiInstanceResponse[]>(
    getMswURL(getUrl(ApiEndpoints.RDI_INSTANCES)),
    async () => {
      HttpResponse.json(
        [
          {
            id: '1',
            name: 'My first integration',
            url: 'redis-12345.c253.us-central1-1.gce.cloud.redislabs.com:12345',
            lastConnection: new Date(),
            version: '1.2',
            type: 'api',
            username: 'user',
          },
        ],
        { status: 200 },
      )
    },
  ),

  // create rdi instance
  http.post(getMswURL(ApiEndpoints.RDI_INSTANCES), async () => {
    HttpResponse.json({}, { status: 200 })
  }),

  // update rdi instance
  http.patch(getMswURL(getUrl('1', ApiEndpoints.RDI_INSTANCES)), async () => {
    HttpResponse.json({}, { status: 200 })
  }),

  // delete rdi instance
  http.delete(getMswURL(ApiEndpoints.RDI_INSTANCES), async () => {
    HttpResponse.json({}, { status: 200 })
  }),
]

export default handlers
