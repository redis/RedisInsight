import { http, HttpHandler, HttpResponse } from 'msw'
import { ApiEndpoints } from 'uiSrc/constants'
import { ConnectionType, Instance } from 'uiSrc/slices/interfaces'
import { getMswURL } from 'uiSrc/utils/test-utils'
import { getUrl } from 'uiSrc/utils'
import { MOCK_INFO_API_RESPONSE } from 'uiSrc/mocks/data/instances'

export const INSTANCE_ID_MOCK = 'instanceId'
export const INSTANCES_MOCK: Instance[] = [
  {
    id: INSTANCE_ID_MOCK,
    version: '6.2.6',
    host: 'localhost',
    port: 6379,
    name: 'localhost',
    username: null,
    password: null,
    connectionType: ConnectionType.Standalone,
    nameFromProvider: null,
    modules: [],
    db: 123,
    lastConnection: new Date('2021-04-22T09:03:56.917Z'),
    version: null,
  },
  {
    id: 'a0db1bc8-a353-4c43-a856-b72f4811d2d4',
    host: 'localhost',
    port: 12000,
    name: 'oea123123',
    username: null,
    password: null,
    connectionType: ConnectionType.Standalone,
    nameFromProvider: null,
    modules: [],
    tls: {
      verifyServerCert: true,
      caCertId: '70b95d32-c19d-4311-bb24-e684af12cf15',
      clientCertPairId: '70b95d32-c19d-4311-b23b24-e684af12cf15',
    },
  },
  {
    id: 'b83a3932-e95f-4f09-9d8a-55079f400186',
    version: '6.2.6',
    host: 'localhost',
    port: 5005,
    name: 'sentinel',
    username: null,
    password: null,
    connectionType: ConnectionType.Sentinel,
    nameFromProvider: null,
    lastConnection: new Date('2021-04-22T18:40:44.031Z'),
    modules: [],
    version: null,
    endpoints: [
      {
        host: 'localhost',
        port: 5005,
      },
      {
        host: '127.0.0.1',
        port: 5006,
      },
    ],
    sentinelMaster: {
      name: 'mymaster',
    },
  },
]

export const getDatabasesApiSpy = jest
  .fn()
  .mockImplementation(async () =>
    HttpResponse.json(INSTANCES_MOCK, { status: 200 }),
  )

const handlers: HttpHandler[] = [
  // fetchInstancesAction
  http.get(getMswURL(ApiEndpoints.DATABASES), getDatabasesApiSpy),
  http.post(getMswURL(ApiEndpoints.DATABASES_EXPORT), async () => {
    return HttpResponse.json(INSTANCES_MOCK, { status: 200 })
  }),
  http.get(getMswURL(getUrl(INSTANCE_ID_MOCK)), async () => {
    return HttpResponse.json(INSTANCES_MOCK[0], { status: 200 })
  }),
  http.get(
    getMswURL(`/${ApiEndpoints.DATABASES}/:id/info`),
    // getMswURL(getUrl(INSTANCE_ID_MOCK, 'info')),
    async () => {
      return HttpResponse.json(MOCK_INFO_API_RESPONSE, { status: 200 })
    },
  ),
  http.get(getMswURL(`${ApiEndpoints.DATABASES}/:id/connect`), async () => {
    return HttpResponse.text('', { status: 200 })
  }),
  http.post<
    any,
    {
      name: string
      host: string
      port: number
      username: string
      timeout: number
      tls: boolean
    },
    Partial<Instance>
  >(getMswURL(`${ApiEndpoints.DATABASES}`), async ({ request }) => {
    const { username } = await request.json()

    return HttpResponse.json(
      {
        id: 'f79e82e8-c34a-4dc7-a49e-9fadc0979fda',
        username,
        host: 'localhost',
        port: 6379,
      },
      { status: 201 },
    )
  }),
]

export default handlers
