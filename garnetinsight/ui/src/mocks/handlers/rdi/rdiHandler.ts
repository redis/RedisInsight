import { http, HttpHandler, HttpResponse } from 'msw'
import { getMswURL } from 'uiSrc/utils/test-utils'
import { getUrl } from 'uiSrc/utils'
import { ApiEndpoints } from 'uiSrc/constants'

const handlers: HttpHandler[] = [
  // fetch rdi instances
  http.get(getMswURL(getUrl(ApiEndpoints.RDI_INSTANCES)), async () => {
    return HttpResponse.json(
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
  }),
  http.get(
    getMswURL(`/${ApiEndpoints.RDI_INSTANCES}/:id/pipeline`),
    async () => {
      return HttpResponse.json(
        {
          jobs: [
            { name: 'job1', value: 'value' },
            { name: 'job2', value: 'value' },
          ],
          config: { field: 'value' },
        },
        { status: 200 },
      )
    },
  ),

  // create rdi instance
  http.post(getMswURL(ApiEndpoints.RDI_INSTANCES), async () => {
    return HttpResponse.json({}, { status: 200 })
  }),

  // update rdi instance
  http.patch(getMswURL(getUrl('1', ApiEndpoints.RDI_INSTANCES)), async () => {
    return HttpResponse.json({}, { status: 200 })
  }),

  // delete rdi instance
  http.delete(getMswURL(ApiEndpoints.RDI_INSTANCES), async () => {
    return HttpResponse.json({}, { status: 200 })
  }),
]

export default handlers
