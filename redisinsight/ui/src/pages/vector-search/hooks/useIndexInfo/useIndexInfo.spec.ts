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

import { useIndexInfo } from './useIndexInfo'

const instanceId = 'test-instance-id'
const indexName = 'test-index'

const getMockedStore = () => {
  const state = cloneDeep(initialStateDefault)
  state.connections.instances.connectedInstance = {
    ...state.connections.instances.connectedInstance,
    id: instanceId,
  }
  return mockStore(state)
}

describe('useIndexInfo', () => {
  beforeEach(() => {
    mswServer.resetHandlers()
  })

  it('should return initial state correctly', () => {
    const { result } = renderHook(() => useIndexInfo({ indexName: '' }), {
      store: getMockedStore(),
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.indexInfo).toBeNull()
  })

  it('should not fetch when indexName is empty', async () => {
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

    renderHook(() => useIndexInfo({ indexName: '' }), {
      store: getMockedStore(),
    })

    expect(requestSpy).not.toHaveBeenCalled()
  })

  it('should fetch index info successfully', async () => {
    const mockApiResponse = indexInfoFactory.build()

    mswServer.use(
      http.post(
        getMswURL(getUrl(instanceId, ApiEndpoints.REDISEARCH_INFO)),
        async ({ request }) => {
          const body = await request.json()
          expect(body).toEqual({ index: indexName })
          return HttpResponse.json(mockApiResponse, { status: 200 })
        },
      ),
    )

    const { result } = renderHook(() => useIndexInfo({ indexName }), {
      store: getMockedStore(),
    })

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeNull()
    expect(result.current.indexInfo).not.toBeNull()

    // Verify transformation applied correctly
    expect(result.current.indexInfo?.indexDefinition?.keyType).toBe(
      mockApiResponse.index_definition?.key_type,
    )
    expect(result.current.indexInfo?.numDocs).toBe(
      Number(mockApiResponse.num_docs),
    )
    expect(result.current.indexInfo?.attributes[0].type).toBe(
      mockApiResponse.attributes[0].type.toLowerCase(),
    )
  })

  it('should handle API errors correctly', async () => {
    mswServer.use(
      http.post(
        getMswURL(getUrl(instanceId, ApiEndpoints.REDISEARCH_INFO)),
        async () =>
          HttpResponse.json({ message: 'Server error' }, { status: 500 }),
      ),
    )

    const { result } = renderHook(() => useIndexInfo({ indexName }), {
      store: getMockedStore(),
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Failed to fetch index info')
    expect(result.current.indexInfo).toBeNull()
  })

  it('should refetch when refetch is called', async () => {
    let callCount = 0
    const mockApiResponse = indexInfoFactory.build()

    mswServer.use(
      http.post(
        getMswURL(getUrl(instanceId, ApiEndpoints.REDISEARCH_INFO)),
        async () => {
          callCount++
          return HttpResponse.json(mockApiResponse, { status: 200 })
        },
      ),
    )

    const { result } = renderHook(() => useIndexInfo({ indexName }), {
      store: getMockedStore(),
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(callCount).toBe(1)

    // Call refetch
    await act(async () => {
      result.current.refetch()
    })

    await waitFor(() => {
      expect(callCount).toBe(2)
    })
  })

  it('should ignore stale responses when indexName changes rapidly', async () => {
    const firstIndexResponse = indexInfoFactory.build({
      index_name: 'idx:first',
      num_docs: '100',
    })
    const secondIndexResponse = indexInfoFactory.build({
      index_name: 'idx:second',
      num_docs: '200',
    })

    let resolveFirst: () => void
    const firstRequestPromise = new Promise<void>((resolve) => {
      resolveFirst = resolve
    })

    mswServer.use(
      http.post(
        getMswURL(getUrl(instanceId, ApiEndpoints.REDISEARCH_INFO)),
        async ({ request }) => {
          const body = (await request.json()) as { index: string }

          if (body.index === 'first-index') {
            // First request is delayed
            await firstRequestPromise
            return HttpResponse.json(firstIndexResponse, { status: 200 })
          }
          // Second request returns immediately
          return HttpResponse.json(secondIndexResponse, { status: 200 })
        },
      ),
    )

    const { result, rerender } = renderHook(
      (initialProps) =>
        useIndexInfo({
          indexName: (initialProps as { name: string })?.name ?? '',
        }),
      {
        store: getMockedStore(),
        initialProps: { name: 'first-index' },
      },
    )

    // First fetch starts
    expect(result.current.loading).toBe(true)

    // Change indexName before first request completes
    rerender({ name: 'second-index' })

    // Wait for second request to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Should have data from second request
    expect(result.current.indexInfo?.numDocs).toBe(200)

    // Now complete the first (stale) request
    await act(async () => {
      resolveFirst!()
    })

    // Should still have data from second request (stale response ignored)
    expect(result.current.indexInfo?.numDocs).toBe(200)
    expect(result.current.loading).toBe(false)
  })

  it('should not get stuck in loading state when indexName becomes empty while fetch is in progress', async () => {
    let resolveRequest: () => void
    const requestPromise = new Promise<void>((resolve) => {
      resolveRequest = resolve
    })
    const mockApiResponse = indexInfoFactory.build()

    mswServer.use(
      http.post(
        getMswURL(getUrl(instanceId, ApiEndpoints.REDISEARCH_INFO)),
        async () => {
          await requestPromise
          return HttpResponse.json(mockApiResponse, { status: 200 })
        },
      ),
    )

    const { result, rerender } = renderHook(
      (initialProps) =>
        useIndexInfo({
          indexName: (initialProps as { name: string })?.name ?? '',
        }),
      {
        store: getMockedStore(),
        initialProps: { name: indexName },
      },
    )

    expect(result.current.loading).toBe(true)

    // Change indexName to empty while fetch is in progress
    rerender({ name: '' })

    // Loading should be reset (not stuck)
    expect(result.current.loading).toBe(false)

    // Complete the in-flight request
    await act(async () => {
      resolveRequest!()
    })

    // Should remain stable
    expect(result.current.loading).toBe(false)
  })
})
