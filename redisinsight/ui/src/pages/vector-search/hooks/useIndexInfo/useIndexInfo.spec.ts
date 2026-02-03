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
import { indexInfoApiResponseFactory } from 'uiSrc/mocks/factories/vector-search/indexInfoApi.factory'

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

    // Wait a bit to ensure no request is made
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50))
    })

    expect(requestSpy).not.toHaveBeenCalled()
  })

  it('should fetch index info successfully', async () => {
    const mockApiResponse = indexInfoApiResponseFactory.build()

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
    const mockApiResponse = indexInfoApiResponseFactory.build()

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
})
