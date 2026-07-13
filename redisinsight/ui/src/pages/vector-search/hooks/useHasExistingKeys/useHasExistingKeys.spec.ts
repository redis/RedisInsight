import { renderHook } from '@testing-library/react-hooks'

import { apiService } from 'uiSrc/services'
import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'

import { useHasExistingKeys } from './useHasExistingKeys'

jest.mock('uiSrc/slices/hooks', () => ({
  ...jest.requireActual('uiSrc/slices/hooks'),
  useAppSelector: jest.fn((selector) => {
    const state = {
      connections: {
        instances: {
          connectedInstance: { id: 'test-instance' },
        },
      },
      app: {
        info: { encoding: 'utf-8' },
      },
    }
    return selector(state)
  }),
}))

jest.mock('uiSrc/services', () => ({
  apiService: {
    post: jest.fn(),
  },
}))

const mockApiPost = apiService.post as jest.Mock

describe('useHasExistingKeys', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return hasKeys=true when Hash keys exist', async () => {
    mockApiPost.mockResolvedValue({
      status: 200,
      data: [{ keys: [{ name: 'key:1' }], total: 1, cursor: 0 }],
    })

    const { result, waitForNextUpdate } = renderHook(() => useHasExistingKeys())

    await waitForNextUpdate()

    expect(result.current.hasKeys).toBe(true)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(false)
  })

  it('should detect keys held by any cluster node', async () => {
    mockApiPost.mockResolvedValue({
      status: 200,
      data: [
        { keys: [], total: 0, cursor: 0 },
        { keys: [{ name: 'key:1' }], total: 1, cursor: 0 },
      ],
    })

    const { result, waitForNextUpdate } = renderHook(() => useHasExistingKeys())

    await waitForNextUpdate()

    expect(result.current.hasKeys).toBe(true)
  })

  it('should scan with the default scan count', async () => {
    mockApiPost.mockResolvedValue({
      status: 200,
      data: [{ keys: [], total: 0, cursor: 0 }],
    })

    const { waitForNextUpdate } = renderHook(() => useHasExistingKeys())

    await waitForNextUpdate()

    expect(mockApiPost).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ count: SCAN_COUNT_DEFAULT }),
      expect.any(Object),
    )
  })

  it('should treat an incomplete scan as having keys', async () => {
    mockApiPost.mockResolvedValue({
      status: 200,
      data: [{ keys: [], total: 50000, cursor: 12345 }],
    })

    const { result, waitForNextUpdate } = renderHook(() => useHasExistingKeys())

    await waitForNextUpdate()

    expect(result.current.hasKeys).toBe(true)
  })

  it('should return hasKeys=false when no keys exist', async () => {
    mockApiPost.mockResolvedValue({
      status: 200,
      data: [{ keys: [], total: 0, cursor: 0 }],
    })

    const { result, waitForNextUpdate } = renderHook(() => useHasExistingKeys())

    await waitForNextUpdate()

    expect(result.current.hasKeys).toBe(false)
    expect(result.current.loading).toBe(false)
  })

  it('should return hasKeys=false and error=true on API error', async () => {
    mockApiPost.mockRejectedValue(new Error('Network error'))

    const { result, waitForNextUpdate } = renderHook(() => useHasExistingKeys())

    await waitForNextUpdate()

    expect(result.current.hasKeys).toBe(false)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(true)
  })

  it('should be loading initially', () => {
    mockApiPost.mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useHasExistingKeys())

    expect(result.current.loading).toBe(true)
  })

  it('should not scan when disabled', () => {
    const { result } = renderHook(() => useHasExistingKeys(false))

    expect(mockApiPost).not.toHaveBeenCalled()
    expect(result.current.loading).toBe(false)
    expect(result.current.hasKeys).toBe(false)
  })
})
