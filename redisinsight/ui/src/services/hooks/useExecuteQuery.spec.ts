import { renderHook, act } from '@testing-library/react-hooks'
import { rest } from 'msw'
import { ApiEndpoints } from 'uiSrc/constants'
import { mswServer } from 'uiSrc/mocks/server'
import { getMswURL } from 'uiSrc/utils/test-utils'
import { getUrl } from 'uiSrc/utils'
import { RunQueryMode, ResultsMode } from 'uiSrc/slices/interfaces'

import { useExecuteQuery } from './useExecuteQuery'

describe('useExecuteQuery', () => {
  const instanceId = 'test-instance-id'
  const command = 'FT.CREATE idx:bikes_vss ...'

  beforeEach(() => {
    mswServer.resetHandlers()
    jest.clearAllMocks()
  })

  it('should return empty array and not call API when data is null', async () => {
    const { result: hookResult } = renderHook(() => useExecuteQuery())

    let result: any
    await act(async () => {
      result = await hookResult.current(instanceId, null)
    })

    expect(result).toEqual([])
  })

  it('should return empty array and not call API when data is undefined', async () => {
    const { result: hookResult } = renderHook(() => useExecuteQuery())

    let result: any
    await act(async () => {
      result = await hookResult.current(instanceId, undefined)
    })

    expect(result).toEqual([])
  })

  it('should call API with correct parameters and return result', async () => {
    const mockResponse = [{ id: '1', databaseId: instanceId }]

    mswServer.use(
      rest.post(
        getMswURL(
          getUrl(instanceId, ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS),
        ),
        async (req, res, ctx) => {
          const body = await req.json()
          expect(body).toEqual({
            commands: [command],
            mode: RunQueryMode.ASCII,
            resultsMode: ResultsMode.Default,
            type: 'SEARCH',
          })
          return res(ctx.status(200), ctx.json(mockResponse))
        },
      ),
    )

    const { result } = renderHook(() => useExecuteQuery())

    let returned
    await act(async () => {
      returned = await result.current(instanceId, command)
    })

    expect(returned).toEqual(mockResponse)
  })

  it('should invoke afterAll callback on success', async () => {
    const mockResponse = [{ id: '1', databaseId: instanceId }]

    mswServer.use(
      rest.post(
        getMswURL(
          getUrl(instanceId, ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS),
        ),
        async (_req, res, ctx) => res(ctx.status(200), ctx.json(mockResponse)),
      ),
    )

    const afterAll = jest.fn()

    const { result } = renderHook(() => useExecuteQuery())

    await act(async () => {
      await result.current(instanceId, command, { afterAll })
    })

    expect(afterAll).toHaveBeenCalled()
  })

  it('should invoke onFail and throw on error', async () => {
    mswServer.use(
      rest.post(
        getMswURL(
          getUrl(instanceId, ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS),
        ),
        async (_req, res, ctx) => res(ctx.status(500)),
      ),
    )

    const onFail = jest.fn()

    const { result } = renderHook(() => useExecuteQuery())

    await act(async () => {
      await expect(
        result.current(instanceId, command, { onFail }),
      ).rejects.toThrow()
    })

    expect(onFail).toHaveBeenCalled()
  })
})
