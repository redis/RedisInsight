import { renderHook, act } from 'uiSrc/utils/test-utils'
import { useSelector, useDispatch } from 'react-redux'

import { fetchKeyIndexesAction } from 'uiSrc/slices/browser/redisearch'

import { useIsKeyIndexed } from './useIsKeyIndexed'
import { UseIsKeyIndexedStatus } from './useIsKeyIndexed.types'

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}))

jest.mock('uiSrc/slices/browser/redisearch', () => ({
  keyIndexesSelector: jest.fn(),
  fetchKeyIndexesAction: jest.fn((keyName: string, force?: boolean) => ({
    type: 'FETCH_KEY_INDEXES',
    payload: { keyName, force },
  })),
}))

describe('useIsKeyIndexed', () => {
  const mockDispatch = jest.fn()
  const mockUseSelector = useSelector as jest.Mock
  const mockUseDispatch = useDispatch as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseDispatch.mockReturnValue(mockDispatch)
  })

  const setupKeyIndexes = (keyName: string, entry: unknown) => {
    mockUseSelector.mockReturnValue(entry ? { [keyName]: entry } : {})
  }

  it('should return idle status when keyName is empty', () => {
    mockUseSelector.mockReturnValue({})

    const { result } = renderHook(() => useIsKeyIndexed(''))

    expect(result.current.status).toBe(UseIsKeyIndexedStatus.Idle)
    expect(result.current.isIndexed).toBe(false)
    expect(result.current.indexes).toEqual([])
  })

  it('should not dispatch when keyName is empty', () => {
    mockUseSelector.mockReturnValue({})

    renderHook(() => useIsKeyIndexed(''))

    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('should dispatch fetchKeyIndexesAction on mount with a key', () => {
    mockUseSelector.mockReturnValue({})

    renderHook(() => useIsKeyIndexed('movie:1'))

    expect(mockDispatch).toHaveBeenCalledWith(fetchKeyIndexesAction('movie:1'))
  })

  it('should return loading status when entry is loading', () => {
    setupKeyIndexes('movie:1', { loading: true, data: [], error: '' })

    const { result } = renderHook(() => useIsKeyIndexed('movie:1'))

    expect(result.current.status).toBe(UseIsKeyIndexedStatus.Loading)
    expect(result.current.isIndexed).toBe(false)
    expect(result.current.indexes).toEqual([])
  })

  it('should return ready status with matching indexes', () => {
    const mockIndexes = [
      { name: 'idx:movie', prefixes: ['movie:'], keyType: 'HASH' },
    ]
    setupKeyIndexes('movie:1', { loading: false, data: mockIndexes, error: '' })

    const { result } = renderHook(() => useIsKeyIndexed('movie:1'))

    expect(result.current.status).toBe(UseIsKeyIndexedStatus.Ready)
    expect(result.current.isIndexed).toBe(true)
    expect(result.current.indexes).toEqual(mockIndexes)
  })

  it('should return ready with isIndexed false when no indexes match', () => {
    setupKeyIndexes('session:abc', { loading: false, data: [], error: '' })

    const { result } = renderHook(() => useIsKeyIndexed('session:abc'))

    expect(result.current.status).toBe(UseIsKeyIndexedStatus.Ready)
    expect(result.current.isIndexed).toBe(false)
    expect(result.current.indexes).toEqual([])
  })

  it('should return error status on failure', () => {
    setupKeyIndexes('movie:1', {
      loading: false,
      data: [],
      error: 'Failed to fetch',
    })

    const { result } = renderHook(() => useIsKeyIndexed('movie:1'))

    expect(result.current.status).toBe(UseIsKeyIndexedStatus.Error)
    expect(result.current.isIndexed).toBe(false)
  })

  it('should return idle when entry does not exist yet', () => {
    mockUseSelector.mockReturnValue({})

    const { result } = renderHook(() => useIsKeyIndexed('movie:1'))

    expect(result.current.status).toBe(UseIsKeyIndexedStatus.Idle)
  })

  it('should dispatch with force=true on refresh', async () => {
    setupKeyIndexes('movie:1', { loading: false, data: [], error: '' })

    const { result } = renderHook(() => useIsKeyIndexed('movie:1'))

    await act(async () => {
      await result.current.refresh()
    })

    expect(mockDispatch).toHaveBeenCalledWith(
      fetchKeyIndexesAction('movie:1', true),
    )
  })

  it('should not dispatch refresh when keyName is empty', async () => {
    mockUseSelector.mockReturnValue({})

    const { result } = renderHook(() => useIsKeyIndexed(''))

    mockDispatch.mockClear()

    await act(async () => {
      await result.current.refresh()
    })

    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('should return multiple matching indexes', () => {
    const mockIndexes = [
      { name: 'idx:movie', prefixes: ['movie:'], keyType: 'HASH' },
      { name: 'idx:global', prefixes: [], keyType: 'HASH' },
    ]
    setupKeyIndexes('movie:1', { loading: false, data: mockIndexes, error: '' })

    const { result } = renderHook(() => useIsKeyIndexed('movie:1'))

    expect(result.current.isIndexed).toBe(true)
    expect(result.current.indexes).toHaveLength(2)
  })
})
