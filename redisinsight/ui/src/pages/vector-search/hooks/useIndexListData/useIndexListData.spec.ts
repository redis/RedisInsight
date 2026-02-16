import { act, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { cloneDeep } from 'lodash'
import { ApiEndpoints } from 'uiSrc/constants'
import { mswServer } from 'uiSrc/mocks/server'
import {
  getMswURL,
  mockStore,
  renderHook,
  initialStateDefault,
} from 'uiSrc/utils/test-utils'
import { getUrl } from 'uiSrc/utils'
import { indexInfoFactory } from 'uiSrc/mocks/factories/redisearch/IndexInfo.factory'

import { useIndexListData } from './useIndexListData'

const instanceId = 'test-instance-id'

const getMockedStore = () => {
  const state = cloneDeep(initialStateDefault)
  state.connections.instances.connectedInstance = {
    ...state.connections.instances.connectedInstance,
    id: instanceId,
  }
  return mockStore(state)
}

describe('useIndexListData', () => {
  beforeEach(() => {
    mswServer.resetHandlers()
  })

  it('should return initial state with empty data and no loading', () => {
    const { result } = renderHook(() => useIndexListData([]), {
      store: getMockedStore(),
    })

    expect(result.current.data).toEqual([])
    expect(result.current.loading).toBe(false)
  })

  it('should not fetch when indexNames is empty', async () => {
    const requestSpy = jest.fn()

    mswServer.use(
      http.post(
        getMswURL(getUrl(instanceId, ApiEndpoints.REDISEARCH_INFO)),
        async () => {
          requestSpy()
          return HttpResponse.json({}, { status: 200 })
        },
      ),
    )

    renderHook(() => useIndexListData([]), {
      store: getMockedStore(),
    })

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50))
    })

    expect(requestSpy).not.toHaveBeenCalled()
  })

  it('should fetch and return rows for all provided index names', async () => {
    const mockResponse = indexInfoFactory.build()

    mswServer.use(
      http.post(
        getMswURL(getUrl(instanceId, ApiEndpoints.REDISEARCH_INFO)),
        async () => HttpResponse.json(mockResponse, { status: 200 }),
      ),
    )

    const indexNames = ['idx-a', 'idx-b']

    const { result } = renderHook(() => useIndexListData(indexNames), {
      store: getMockedStore(),
    })

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toHaveLength(2)
    expect(result.current.data[0].name).toBe('idx-a')
    expect(result.current.data[1].name).toBe('idx-b')
    expect(result.current.data[0].numDocs).toBe(Number(mockResponse.num_docs))
  })

  it('should skip failed requests and return only successful rows', async () => {
    const mockResponse = indexInfoFactory.build()
    let callCount = 0

    mswServer.use(
      http.post(
        getMswURL(getUrl(instanceId, ApiEndpoints.REDISEARCH_INFO)),
        async () => {
          callCount++
          if (callCount === 1) {
            return HttpResponse.json(mockResponse, { status: 200 })
          }
          return HttpResponse.json({ message: 'Not found' }, { status: 404 })
        },
      ),
    )

    const { result } = renderHook(
      () => useIndexListData(['idx-ok', 'idx-fail']),
      { store: getMockedStore() },
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toHaveLength(1)
    expect(result.current.data[0].name).toBe('idx-ok')
  })

  it('should reset data when indexNames becomes empty', async () => {
    const mockResponse = indexInfoFactory.build()

    mswServer.use(
      http.post(
        getMswURL(getUrl(instanceId, ApiEndpoints.REDISEARCH_INFO)),
        async () => HttpResponse.json(mockResponse, { status: 200 }),
      ),
    )

    const { result, rerender } = renderHook(
      (initialProps) =>
        useIndexListData((initialProps as { names: string[] })?.names ?? []),
      {
        store: getMockedStore(),
        initialProps: { names: ['idx-a'] },
      },
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toHaveLength(1)

    rerender({ names: [] })

    expect(result.current.data).toEqual([])
  })

  it('should ignore stale responses when indexNames changes', async () => {
    const firstResponse = indexInfoFactory.build({ num_docs: '100' })
    const secondResponse = indexInfoFactory.build({ num_docs: '200' })

    let resolveFirst: () => void
    const firstRequestPromise = new Promise<void>((resolve) => {
      resolveFirst = resolve
    })

    let requestCount = 0

    mswServer.use(
      http.post(
        getMswURL(getUrl(instanceId, ApiEndpoints.REDISEARCH_INFO)),
        async () => {
          requestCount++
          if (requestCount === 1) {
            await firstRequestPromise
            return HttpResponse.json(firstResponse, { status: 200 })
          }
          return HttpResponse.json(secondResponse, { status: 200 })
        },
      ),
    )

    const { result, rerender } = renderHook(
      (initialProps) =>
        useIndexListData((initialProps as { names: string[] })?.names ?? []),
      {
        store: getMockedStore(),
        initialProps: { names: ['idx-first'] },
      },
    )

    expect(result.current.loading).toBe(true)

    rerender({ names: ['idx-second'] })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toHaveLength(1)
    expect(result.current.data[0].numDocs).toBe(200)

    await act(async () => {
      resolveFirst!()
      await new Promise((resolve) => setTimeout(resolve, 50))
    })

    expect(result.current.data[0].numDocs).toBe(200)
  })
})
