import { http, HttpResponse } from 'msw'
import { act, renderHook, waitFor, getMswURL } from 'uiSrc/utils/test-utils'
import { ApiEndpoints } from 'uiSrc/constants'
import { getUrl } from 'uiSrc/utils'
import { mswServer } from 'uiSrc/mocks/server'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/instances/instancesHandlers'
import { QUERY_LIBRARY_ITEMS_MOCK } from 'uiSrc/mocks/handlers/browser/queryLibraryHandlers'
import { QueryLibraryService } from 'uiSrc/services/query-library/QueryLibraryService'

import { useQueryLibrary } from './useQueryLibrary'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const routerDom = require('react-router-dom')

const mockIndexName = 'test-index'

describe('useQueryLibrary hook', () => {
  const originalUseParams = routerDom.useParams

  beforeEach(() => {
    routerDom.useParams = () => ({
      instanceId: INSTANCE_ID_MOCK,
      indexName: mockIndexName,
    })
  })

  afterAll(() => {
    routerDom.useParams = originalUseParams
  })

  it('should load items on mount', async () => {
    const { result } = renderHook(() => useQueryLibrary())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.items).toEqual(QUERY_LIBRARY_ITEMS_MOCK)
  })

  it('should set loading to true initially', () => {
    const { result } = renderHook(() => useQueryLibrary())

    expect(result.current.loading).toBe(true)
  })

  it('should handle empty result from service', async () => {
    mswServer.use(
      http.get(
        getMswURL(getUrl(INSTANCE_ID_MOCK, ApiEndpoints.QUERY_LIBRARY)),
        async () => HttpResponse.json([], { status: 200 }),
      ),
    )

    const { result } = renderHook(() => useQueryLibrary())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.items).toEqual([])
  })

  it('should handle service errors and set error state', async () => {
    jest
      .spyOn(QueryLibraryService.prototype, 'getList')
      .mockRejectedValueOnce(new Error('Unexpected failure'))

    const { result } = renderHook(() => useQueryLibrary())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Failed to load query library')
    expect(result.current.items).toEqual([])
  })

  it('should delete item and update list', async () => {
    const { result } = renderHook(() => useQueryLibrary())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const idToDelete = QUERY_LIBRARY_ITEMS_MOCK[0].id

    await act(async () => {
      await result.current.deleteItem(idToDelete)
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].id).toBe(QUERY_LIBRARY_ITEMS_MOCK[1].id)
  })

  it('should toggle item open state', async () => {
    const { result } = renderHook(() => useQueryLibrary())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.toggleItemOpen(QUERY_LIBRARY_ITEMS_MOCK[0].id)
    })

    expect(result.current.openItemId).toBe(QUERY_LIBRARY_ITEMS_MOCK[0].id)

    act(() => {
      result.current.toggleItemOpen(QUERY_LIBRARY_ITEMS_MOCK[0].id)
    })

    expect(result.current.openItemId).toBeNull()
  })

  it('should get item by id', async () => {
    const { result } = renderHook(() => useQueryLibrary())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.getItemById(QUERY_LIBRARY_ITEMS_MOCK[0].id)).toEqual(
      QUERY_LIBRARY_ITEMS_MOCK[0],
    )
    expect(result.current.getItemById('nonexistent')).toBeUndefined()
  })

  it('should update search state when onSearchChange is called', async () => {
    const { result } = renderHook(() => useQueryLibrary())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.onSearchChange('test query')
    })

    expect(result.current.search).toBe('test query')
  })
})
