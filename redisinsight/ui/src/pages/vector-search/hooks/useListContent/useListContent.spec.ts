import { renderHook, act } from 'uiSrc/utils/test-utils'
import { useDispatch, useSelector } from 'react-redux'
import reactRouterDom from 'react-router-dom'
import { faker } from '@faker-js/faker'

import { Pages } from 'uiSrc/constants'
import {
  deleteRedisearchIndexAction,
  redisearchListSelector,
  setSelectedIndex,
  resetRedisearchKeysData,
} from 'uiSrc/slices/browser/redisearch'
import { changeSearchMode } from 'uiSrc/slices/browser/keys'
import { resetBrowserTree } from 'uiSrc/slices/app/context'
import { SearchMode } from 'uiSrc/slices/interfaces/keys'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { stringToBuffer } from 'uiSrc/utils'

import { useIndexListData } from '../useIndexListData'
import { useListContent } from './useListContent'

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}))

jest.mock('../useIndexListData', () => ({
  useIndexListData: jest.fn(() => ({
    data: [],
    loading: false,
  })),
}))

jest.mock('uiSrc/slices/browser/redisearch', () => ({
  ...jest.requireActual('uiSrc/slices/browser/redisearch'),
  redisearchListSelector: jest.fn(),
  deleteRedisearchIndexAction: jest.fn().mockReturnValue({ type: 'delete' }),
  setSelectedIndex: jest.fn().mockReturnValue({ type: 'setSelectedIndex' }),
  resetRedisearchKeysData: jest
    .fn()
    .mockReturnValue({ type: 'resetRedisearchKeysData' }),
}))

jest.mock('uiSrc/slices/browser/keys', () => ({
  ...jest.requireActual('uiSrc/slices/browser/keys'),
  changeSearchMode: jest
    .fn()
    .mockReturnValue({ type: 'changeSearchMode' }),
}))

jest.mock('uiSrc/slices/app/context', () => ({
  ...jest.requireActual('uiSrc/slices/app/context'),
  resetBrowserTree: jest
    .fn()
    .mockReturnValue({ type: 'resetBrowserTree' }),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  connectedInstanceSelector: jest.fn(),
}))

jest.mock('uiSrc/services', () => ({
  localStorageService: {
    set: jest.fn(),
    get: jest.fn(),
  },
}))

jest.mock('uiSrc/pages/vector-search-deprecated/telemetry', () => ({
  collectManageIndexesDeleteTelemetry: jest.fn(),
}))

jest.mock('uiSrc/services/query-library/QueryLibraryService', () => ({
  QueryLibraryService: jest.fn().mockImplementation(() => ({
    deleteByIndex: jest.fn(),
  })),
}))

const mockDispatch = jest.fn()
const mockPush = jest.fn()
const mockInstanceId = faker.string.uuid()
const mockDatabaseId = faker.string.uuid()

describe('useListContent', () => {
  const mockUseSelector = useSelector as jest.Mock
  const mockUseDispatch = useDispatch as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseDispatch.mockReturnValue(mockDispatch)
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: mockPush })
    reactRouterDom.useParams = jest
      .fn()
      .mockReturnValue({ instanceId: mockInstanceId })

    mockUseSelector.mockImplementation((selector: any) => {
      if (selector === redisearchListSelector) {
        return { data: [] }
      }
      if (selector === connectedInstanceSelector) {
        return { id: mockDatabaseId }
      }
      return {}
    })
    ;(useIndexListData as jest.Mock).mockReturnValue({
      data: [],
      loading: false,
    })
  })

  it('should return data and loading from useIndexListData', () => {
    const mockData = [{ id: 'idx', name: 'idx' }]
    ;(useIndexListData as jest.Mock).mockReturnValue({
      data: mockData,
      loading: true,
    })

    const { result } = renderHook(() => useListContent())

    expect(result.current.data).toBe(mockData)
    expect(result.current.loading).toBe(true)
  })

  it('should return three actions', () => {
    const { result } = renderHook(() => useListContent())

    expect(result.current.actions).toHaveLength(3)
    expect(result.current.actions[0].name).toBe('View index')
    expect(result.current.actions[1].name).toBe('Browse dataset')
    expect(result.current.actions[2].name).toBe('Delete')
    expect(result.current.actions[2].variant).toBe('destructive')
  })

  describe('onQueryClick', () => {
    it('should navigate to vector search query page', () => {
      const { result } = renderHook(() => useListContent())
      const indexName = faker.string.alpha(10)

      act(() => {
        result.current.onQueryClick(indexName)
      })

      expect(mockPush).toHaveBeenCalledWith(
        Pages.vectorSearchQuery(mockInstanceId, indexName),
      )
    })
  })

  describe('View index action', () => {
    it('should set viewingIndexName when callback is invoked', () => {
      const { result } = renderHook(() => useListContent())
      const indexName = faker.string.alpha(10)

      expect(result.current.viewingIndexName).toBeNull()

      act(() => {
        result.current.actions[0].callback(indexName)
      })

      expect(result.current.viewingIndexName).toBe(indexName)
    })

    it('should clear viewingIndexName when onCloseViewPanel is called', () => {
      const { result } = renderHook(() => useListContent())

      act(() => {
        result.current.actions[0].callback('my-index')
      })
      expect(result.current.viewingIndexName).toBe('my-index')

      act(() => {
        result.current.onCloseViewPanel()
      })
      expect(result.current.viewingIndexName).toBeNull()
    })
  })

  describe('Browse dataset action', () => {
    it('should dispatch correct actions and navigate to browser', () => {
      const { result } = renderHook(() => useListContent())
      const indexName = faker.string.alpha(10)

      act(() => {
        result.current.actions[1].callback(indexName)
      })

      expect(mockDispatch).toHaveBeenCalledWith(
        changeSearchMode(SearchMode.Redisearch),
      )
      expect(mockDispatch).toHaveBeenCalledWith(
        setSelectedIndex(stringToBuffer(indexName)),
      )
      expect(mockDispatch).toHaveBeenCalledWith(resetRedisearchKeysData())
      expect(mockDispatch).toHaveBeenCalledWith(resetBrowserTree())
      expect(mockPush).toHaveBeenCalledWith(
        Pages.browser(mockInstanceId),
      )
    })
  })

  describe('Delete action', () => {
    it('should set pendingDeleteIndex when callback is invoked', () => {
      const { result } = renderHook(() => useListContent())
      const indexName = faker.string.alpha(10)

      expect(result.current.pendingDeleteIndex).toBeNull()

      act(() => {
        result.current.actions[2].callback(indexName)
      })

      expect(result.current.pendingDeleteIndex).toBe(indexName)
    })

    it('should dispatch delete action on confirm', () => {
      const { result } = renderHook(() => useListContent())
      const indexName = faker.string.alpha(10)

      act(() => {
        result.current.actions[2].callback(indexName)
      })

      act(() => {
        result.current.onConfirmDelete()
      })

      expect(deleteRedisearchIndexAction).toHaveBeenCalled()
      expect(result.current.pendingDeleteIndex).toBeNull()
    })

    it('should clear pendingDeleteIndex on close', () => {
      const { result } = renderHook(() => useListContent())

      act(() => {
        result.current.actions[2].callback('some-index')
      })
      expect(result.current.pendingDeleteIndex).toBe('some-index')

      act(() => {
        result.current.onCloseDelete()
      })
      expect(result.current.pendingDeleteIndex).toBeNull()
    })

    it('should not dispatch when confirming without pending index', () => {
      const { result } = renderHook(() => useListContent())

      act(() => {
        result.current.onConfirmDelete()
      })

      expect(deleteRedisearchIndexAction).not.toHaveBeenCalled()
    })
  })
})
