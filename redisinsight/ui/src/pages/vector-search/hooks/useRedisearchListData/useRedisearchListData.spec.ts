import { renderHook, waitFor } from 'uiSrc/utils/test-utils'
import { useSelector, useDispatch } from 'react-redux'
import {
  redisearchListSelector,
  fetchRedisearchListAction,
} from 'uiSrc/slices/browser/redisearch'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { isRedisearchAvailable, bufferToString } from 'uiSrc/utils'
import { useRedisearchListData } from './useRedisearchListData'

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}))

jest.mock('uiSrc/slices/browser/redisearch', () => ({
  redisearchListSelector: jest.fn(),
  fetchRedisearchListAction: jest.fn(() => ({ type: 'FETCH_REDISEARCH_LIST' })),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  connectedInstanceSelector: jest.fn(),
}))

jest.mock('uiSrc/utils', () => ({
  isRedisearchAvailable: jest.fn(),
  bufferToString: jest.fn((str) => `string-${str.data}`),
}))

describe('useRedisearchListData', () => {
  const mockDispatch = jest.fn()
  const mockUseSelector = useSelector as jest.Mock
  const mockUseDispatch = useDispatch as jest.Mock
  const mockIsRedisearchAvailable = isRedisearchAvailable as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseDispatch.mockReturnValue(mockDispatch)
  })

  const setupMocks = (
    redisearchState: { loading: boolean; data: any[] },
    instanceState: { modules?: any[]; host?: string },
  ) => {
    mockUseSelector.mockImplementation((selector: any) => {
      if (selector === redisearchListSelector) {
        return redisearchState
      }
      if (selector === connectedInstanceSelector) {
        return instanceState
      }
      return {}
    })
  }

  it('should return loading state and data', () => {
    setupMocks({ loading: true, data: [] }, { modules: [], host: 'localhost' })
    mockIsRedisearchAvailable.mockReturnValue(false)

    const { result } = renderHook(() => useRedisearchListData())

    expect(result.current.loading).toBe(true)
    expect(result.current.data).toEqual([])
    expect(result.current.stringData).toEqual([])
  })

  it('should dispatch fetchRedisearchListAction when redisearch module is available', async () => {
    setupMocks(
      { loading: false, data: [] },
      { modules: [{ name: 'search' }], host: 'localhost' },
    )
    mockIsRedisearchAvailable.mockReturnValue(true)

    renderHook(() => useRedisearchListData())

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(fetchRedisearchListAction())
    })
  })

  it('should not dispatch action when host is not available', () => {
    setupMocks(
      { loading: false, data: [] },
      { modules: [{ name: 'search' }], host: undefined },
    )
    mockIsRedisearchAvailable.mockReturnValue(true)

    renderHook(() => useRedisearchListData())

    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('should not dispatch action when redisearch module is not available', () => {
    setupMocks({ loading: false, data: [] }, { modules: [], host: 'localhost' })
    mockIsRedisearchAvailable.mockReturnValue(false)

    renderHook(() => useRedisearchListData())

    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('should convert data to string data', () => {
    const mockData = [{ data: 'index1' }, { data: 'index2' }]
    setupMocks(
      { loading: false, data: mockData },
      { modules: [], host: 'localhost' },
    )
    mockIsRedisearchAvailable.mockReturnValue(false)

    const { result } = renderHook(() => useRedisearchListData())

    expect(result.current.stringData).toEqual([
      'string-index1',
      'string-index2',
    ])
    expect(bufferToString).toHaveBeenCalledTimes(2)
  })
})
