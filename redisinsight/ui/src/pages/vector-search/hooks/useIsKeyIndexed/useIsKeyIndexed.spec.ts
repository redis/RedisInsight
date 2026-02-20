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

import { useIsKeyIndexed } from './useIsKeyIndexed'
import { UseIsKeyIndexedStatus } from './useIsKeyIndexed.types'

const instanceId = 'test-instance-id'

const getMockedStore = () => {
  const state = cloneDeep(initialStateDefault)
  state.connections.instances.connectedInstance = {
    ...state.connections.instances.connectedInstance,
    id: instanceId,
  }
  return mockStore(state)
}

const mockKeyIndexesResponse = (indexes: Array<{ name: string; prefixes: string[]; key_type: string }>) => ({
  indexes,
})

const mockMovieIndex = { name: 'idx:movie', prefixes: ['movie:'], key_type: 'HASH' }
const mockUserIndex = { name: 'idx:user', prefixes: ['user:'], key_type: 'HASH' }

describe('useIsKeyIndexed', () => {
  beforeEach(() => {
    mswServer.resetHandlers()
  })

  it('should return idle status when keyName is empty', () => {
    const { result } = renderHook(() => useIsKeyIndexed(''), {
      store: getMockedStore(),
    })

    expect(result.current.status).toBe(UseIsKeyIndexedStatus.Idle)
    expect(result.current.isIndexed).toBe(false)
    expect(result.current.indexes).toEqual([])
  })

  it('should transition from loading to ready on successful fetch', async () => {
    mswServer.use(
      http.post(
        getMswURL(getUrl(instanceId, ApiEndpoints.REDISEARCH_KEY_INDEXES)),
        async () =>
          HttpResponse.json(
            mockKeyIndexesResponse([mockMovieIndex]),
            { status: 200 },
          ),
      ),
    )

    const { result } = renderHook(() => useIsKeyIndexed('movie:1'), {
      store: getMockedStore(),
    })

    expect(result.current.status).toBe(UseIsKeyIndexedStatus.Loading)

    await waitFor(() => {
      expect(result.current.status).toBe(UseIsKeyIndexedStatus.Ready)
    })

    expect(result.current.isIndexed).toBe(true)
    expect(result.current.indexes).toHaveLength(1)
    expect(result.current.indexes[0].name).toBe('idx:movie')
    expect(result.current.indexes[0].keyType).toBe('HASH')
    expect(result.current.indexes[0].prefixes).toEqual(['movie:'])
  })

  it('should return isIndexed false when no indexes match', async () => {
    mswServer.use(
      http.post(
        getMswURL(getUrl(instanceId, ApiEndpoints.REDISEARCH_KEY_INDEXES)),
        async () =>
          HttpResponse.json(mockKeyIndexesResponse([]), { status: 200 }),
      ),
    )

    const { result } = renderHook(() => useIsKeyIndexed('session:abc'), {
      store: getMockedStore(),
    })

    await waitFor(() => {
      expect(result.current.status).toBe(UseIsKeyIndexedStatus.Ready)
    })

    expect(result.current.isIndexed).toBe(false)
    expect(result.current.indexes).toEqual([])
  })

  it('should return multiple matching indexes', async () => {
    mswServer.use(
      http.post(
        getMswURL(getUrl(instanceId, ApiEndpoints.REDISEARCH_KEY_INDEXES)),
        async () =>
          HttpResponse.json(
            mockKeyIndexesResponse([mockMovieIndex, mockUserIndex]),
            { status: 200 },
          ),
      ),
    )

    const { result } = renderHook(() => useIsKeyIndexed('movie:1'), {
      store: getMockedStore(),
    })

    await waitFor(() => {
      expect(result.current.status).toBe(UseIsKeyIndexedStatus.Ready)
    })

    expect(result.current.isIndexed).toBe(true)
    expect(result.current.indexes).toHaveLength(2)
  })

  it('should set error status on API failure', async () => {
    mswServer.use(
      http.post(
        getMswURL(getUrl(instanceId, ApiEndpoints.REDISEARCH_KEY_INDEXES)),
        async () =>
          HttpResponse.json({ message: 'Server error' }, { status: 500 }),
      ),
    )

    const { result } = renderHook(() => useIsKeyIndexed('movie:1'), {
      store: getMockedStore(),
    })

    await waitFor(() => {
      expect(result.current.status).toBe(UseIsKeyIndexedStatus.Error)
    })

    expect(result.current.isIndexed).toBe(false)
    expect(result.current.indexes).toEqual([])
  })

  it('should use cached result for the same key on re-render', async () => {
    let callCount = 0

    mswServer.use(
      http.post(
        getMswURL(getUrl(instanceId, ApiEndpoints.REDISEARCH_KEY_INDEXES)),
        async () => {
          callCount++
          return HttpResponse.json(
            mockKeyIndexesResponse([mockMovieIndex]),
            { status: 200 },
          )
        },
      ),
    )

    const { result, rerender } = renderHook(
      (initialProps) =>
        useIsKeyIndexed((initialProps as { key: string })?.key ?? ''),
      {
        store: getMockedStore(),
        initialProps: { key: 'movie:1' },
      },
    )

    await waitFor(() => {
      expect(result.current.status).toBe(UseIsKeyIndexedStatus.Ready)
    })

    expect(callCount).toBe(1)

    // Re-render with the same key
    rerender({ key: 'movie:1' })

    // Should still be ready without additional fetch
    expect(result.current.status).toBe(UseIsKeyIndexedStatus.Ready)
    expect(callCount).toBe(1)
  })

  it('should clear cache and re-fetch on refresh', async () => {
    let callCount = 0

    mswServer.use(
      http.post(
        getMswURL(getUrl(instanceId, ApiEndpoints.REDISEARCH_KEY_INDEXES)),
        async () => {
          callCount++
          return HttpResponse.json(
            mockKeyIndexesResponse([mockMovieIndex]),
            { status: 200 },
          )
        },
      ),
    )

    const { result } = renderHook(() => useIsKeyIndexed('movie:1'), {
      store: getMockedStore(),
    })

    await waitFor(() => {
      expect(result.current.status).toBe(UseIsKeyIndexedStatus.Ready)
    })

    expect(callCount).toBe(1)

    await act(async () => {
      await result.current.refresh()
    })

    await waitFor(() => {
      expect(callCount).toBe(2)
    })
  })

  it('should not fetch when no instance is connected', async () => {
    const requestSpy = jest.fn()

    mswServer.use(
      http.post(
        getMswURL(getUrl(instanceId, ApiEndpoints.REDISEARCH_KEY_INDEXES)),
        async () => {
          requestSpy()
          return HttpResponse.json(mockKeyIndexesResponse([]), { status: 200 })
        },
      ),
    )

    const state = cloneDeep(initialStateDefault)
    // No connected instance
    const store = mockStore(state)

    renderHook(() => useIsKeyIndexed('movie:1'), { store })

    await act(async () => {
      await new Promise((resolve) => { setTimeout(resolve, 50) })
    })

    expect(requestSpy).not.toHaveBeenCalled()
  })

  it('should send correct key in request body', async () => {
    let receivedBody: unknown

    mswServer.use(
      http.post(
        getMswURL(getUrl(instanceId, ApiEndpoints.REDISEARCH_KEY_INDEXES)),
        async ({ request }) => {
          receivedBody = await request.json()
          return HttpResponse.json(mockKeyIndexesResponse([]), { status: 200 })
        },
      ),
    )

    renderHook(() => useIsKeyIndexed('user:42'), {
      store: getMockedStore(),
    })

    await waitFor(() => {
      expect(receivedBody).toEqual({ key: 'user:42' })
    })
  })
})
