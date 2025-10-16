import { http, HttpResponse } from 'msw'
import { ApiEndpoints } from 'uiSrc/constants'
import { mswServer } from 'uiSrc/mocks/server'
import { getMswURL } from 'uiSrc/utils/test-utils'
import { getUrl } from 'uiSrc/utils'
import { ResultsMode, RunQueryMode } from 'uiSrc/slices/interfaces'
import executeQuery from './executeQuery'

describe('executeQuery', () => {
  const instanceId = 'test-instance-id'
  const command = 'FT.CREATE idx:bikes_vss ...'

  beforeEach(() => {
    mswServer.resetHandlers()
    jest.clearAllMocks()
  })

  it.each([null, undefined])(
    'returns empty array and does not call API when data is %s',
    async (data) => {
      const result = await executeQuery(instanceId, data as any)
      expect(result).toEqual([])
    },
  )

  it('calls API with correct parameters and returns result', async () => {
    const mockResponse = [{ id: '1', databaseId: instanceId }]

    mswServer.use(
      http.post(
        getMswURL(
          getUrl(instanceId, ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS),
        ),
        async ({ request }) => {
          const body = await request.json()
          expect(body).toEqual({
            commands: [command],
            mode: RunQueryMode.ASCII,
            resultsMode: ResultsMode.Default,
            type: 'SEARCH',
          })
          return HttpResponse.json(mockResponse, { status: 200 })
        },
      ),
    )

    const returned = await executeQuery(instanceId, command)
    expect(returned).toEqual(mockResponse)
  })

  it('invokes afterAll callback on success', async () => {
    const mockResponse = [{ id: '1', databaseId: instanceId }]

    mswServer.use(
      http.post(
        getMswURL(
          getUrl(instanceId, ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS),
        ),
        async () => {
          HttpResponse.json(mockResponse, { status: 200 })
        },
      ),
    )

    const afterAll = jest.fn()

    await executeQuery(instanceId, command, { afterAll })

    expect(afterAll).toHaveBeenCalled()
  })

  it('invokes onFail and rethrows on error', async () => {
    mswServer.use(
      http.post(
        getMswURL(
          getUrl(instanceId, ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS),
        ),
        async () => {
          HttpResponse.text('', { status: 500 })
        },
      ),
    )

    const onFail = jest.fn()

    await expect(
      executeQuery(instanceId, command, { onFail }),
    ).rejects.toThrow()

    expect(onFail).toHaveBeenCalled()
  })
})
