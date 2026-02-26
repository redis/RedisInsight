import { renderHook } from '@testing-library/react-hooks'

import { apiService } from 'uiSrc/services'

import { useHasExistingKeys } from './useHasExistingKeys'

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn((selector) => {
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
      data: [{ keys: [{ name: 'key:1' }], total: 1 }],
    })

    const { result, waitForNextUpdate } = renderHook(() => useHasExistingKeys())

    await waitForNextUpdate()

    expect(result.current.hasKeys).toBe(true)
    expect(result.current.loading).toBe(false)
  })

  it('should return hasKeys=false when no keys exist', async () => {
    mockApiPost.mockResolvedValue({
      status: 200,
      data: [{ keys: [], total: 0 }],
    })

    const { result, waitForNextUpdate } = renderHook(() => useHasExistingKeys())

    await waitForNextUpdate()

    expect(result.current.hasKeys).toBe(false)
    expect(result.current.loading).toBe(false)
  })

  it('should return hasKeys=false on API error', async () => {
    mockApiPost.mockRejectedValue(new Error('Network error'))

    const { result, waitForNextUpdate } = renderHook(() => useHasExistingKeys())

    await waitForNextUpdate()

    expect(result.current.hasKeys).toBe(false)
    expect(result.current.loading).toBe(false)
  })

  it('should be loading initially', () => {
    mockApiPost.mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useHasExistingKeys())

    expect(result.current.loading).toBe(true)
  })
})
