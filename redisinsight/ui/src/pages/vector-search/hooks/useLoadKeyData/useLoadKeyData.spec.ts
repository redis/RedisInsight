import { waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { http, HttpResponse, delay } from 'msw'
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
import {
  FieldTypes,
  RedisearchIndexKeyType,
} from 'uiSrc/pages/browser/components/create-redisearch-index/constants'

import { useLoadKeyData } from './useLoadKeyData'

const instanceId = 'test-instance-id'

const getMockedStore = () => {
  const state = cloneDeep(initialStateDefault)
  state.connections.instances.connectedInstance = {
    ...state.connections.instances.connectedInstance,
    id: instanceId,
  }
  return mockStore(state)
}

const hashKey = { data: [116, 101, 115, 116], type: 'Buffer' }

describe('useLoadKeyData', () => {
  beforeEach(() => {
    mswServer.resetHandlers()
  })

  it('should load hash key fields', async () => {
    mswServer.use(
      http.post(
        getMswURL(getUrl(instanceId, ApiEndpoints.HASH_GET_FIELDS)),
        async () =>
          HttpResponse.json(
            {
              fields: [
                {
                  field: { data: [110, 97, 109, 101], type: 'Buffer' },
                  value: { data: [74, 111, 104, 110], type: 'Buffer' },
                },
              ],
            },
            { status: 200 },
          ),
      ),
    )

    const { result } = renderHook(() => useLoadKeyData(), {
      store: getMockedStore(),
    })

    act(() => {
      result.current.loadKeyData(hashKey as any, RedisearchIndexKeyType.HASH)
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeNull()
    expect(result.current.fields.length).toBeGreaterThan(0)
  })

  it('should load JSON key fields from string response', async () => {
    mswServer.use(
      http.post(
        getMswURL(getUrl(instanceId, ApiEndpoints.REJSON_GET)),
        async () =>
          HttpResponse.json(
            {
              downloaded: true,
              path: '$',
              data: JSON.stringify({ title: 'Test', year: 2024 }),
            },
            { status: 200 },
          ),
      ),
    )

    const { result } = renderHook(() => useLoadKeyData(), {
      store: getMockedStore(),
    })

    act(() => {
      result.current.loadKeyData(hashKey as any, RedisearchIndexKeyType.JSON)
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeNull()
    expect(result.current.fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'title', type: FieldTypes.TAG }),
        expect.objectContaining({ name: 'year', type: FieldTypes.NUMERIC }),
      ]),
    )
  })

  it('should load JSON key fields from array response', async () => {
    mswServer.use(
      http.post(
        getMswURL(getUrl(instanceId, ApiEndpoints.REJSON_GET)),
        async () =>
          HttpResponse.json(
            {
              downloaded: true,
              path: '$',
              data: [{ title: 'Test', year: 2024 }],
            },
            { status: 200 },
          ),
      ),
    )

    const { result } = renderHook(() => useLoadKeyData(), {
      store: getMockedStore(),
    })

    act(() => {
      result.current.loadKeyData(hashKey as any, RedisearchIndexKeyType.JSON)
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'title', type: FieldTypes.TAG }),
        expect.objectContaining({ name: 'year', type: FieldTypes.NUMERIC }),
      ]),
    )
  })

  it('should skip nested objects for JSON keys and report skippedFields', async () => {
    mswServer.use(
      http.post(
        getMswURL(getUrl(instanceId, ApiEndpoints.REJSON_GET)),
        async () =>
          HttpResponse.json(
            {
              downloaded: true,
              path: '$',
              data: JSON.stringify({
                name: 'test',
                nested: { a: 1, b: 2 },
                count: 5,
              }),
            },
            { status: 200 },
          ),
      ),
    )

    const { result } = renderHook(() => useLoadKeyData(), {
      store: getMockedStore(),
    })

    act(() => {
      result.current.loadKeyData(hashKey as any, RedisearchIndexKeyType.JSON)
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.fields).toHaveLength(2)
    expect(result.current.skippedFields).toEqual(['nested'])
  })

  it('should set loading state during fetch', async () => {
    mswServer.use(
      http.post(
        getMswURL(getUrl(instanceId, ApiEndpoints.HASH_GET_FIELDS)),
        async () => {
          await delay(200)
          return HttpResponse.json({ fields: [] }, { status: 200 })
        },
      ),
    )

    const { result } = renderHook(() => useLoadKeyData(), {
      store: getMockedStore(),
    })

    act(() => {
      result.current.loadKeyData(hashKey as any, RedisearchIndexKeyType.HASH)
    })

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })

  it('should handle API errors', async () => {
    mswServer.use(
      http.post(
        getMswURL(getUrl(instanceId, ApiEndpoints.HASH_GET_FIELDS)),
        async () =>
          HttpResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 },
          ),
      ),
    )

    const { result } = renderHook(() => useLoadKeyData(), {
      store: getMockedStore(),
    })

    act(() => {
      result.current.loadKeyData(hashKey as any, RedisearchIndexKeyType.HASH)
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeTruthy()
    expect(result.current.fields).toEqual([])
  })
})
