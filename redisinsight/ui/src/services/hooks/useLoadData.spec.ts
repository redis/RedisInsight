import { renderHook, act } from '@testing-library/react-hooks'

import { useLoadData } from './useLoadData'

describe('useLoadData', () => {
  const filePath = '/test-data.txt'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should load data successfully', async () => {
    const mockText = 'This is mock file content.'
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => mockText,
    })

    const { result } = renderHook(() => useLoadData())

    await act(async () => {
      await result.current.load(filePath)
    })

    expect(global.fetch).toHaveBeenCalledWith(filePath)
    expect(result.current.data).toBe(mockText)
    expect(result.current.error).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  it('should set error if fetch fails (network error)', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Fetch failed'))

    const { result } = renderHook(() => useLoadData())

    await act(async () => {
      try {
        await result.current.load(filePath)
        // eslint-disable-next-line no-empty
      } catch {}
    })

    expect(result.current.data).toBeNull()
    expect(result.current.error).toEqual(expect.any(Error))
    expect(result.current.error?.message).toBe('Fetch failed')
    expect(result.current.loading).toBe(false)
  })

  it('should set error if response is not ok', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      statusText: 'Not Found',
    })

    const { result } = renderHook(() => useLoadData())

    await act(async () => {
      try {
        await result.current.load(filePath)
        // eslint-disable-next-line no-empty
      } catch {}
    })

    expect(result.current.data).toBeNull()
    expect(result.current.error).toEqual(expect.any(Error))
    expect(result.current.error?.message).toBe(
      `Failed to fetch ${filePath}: Not Found`,
    )
    expect(result.current.loading).toBe(false)
  })

  it('should set error if filePath is empty', async () => {
    const { result } = renderHook(() => useLoadData())

    await act(async () => {
      try {
        await result.current.load('')
        // eslint-disable-next-line no-empty
      } catch {}
    })

    expect(result.current.data).toBeNull()
    expect(result.current.error?.message).toBe('File path is required')
    expect(result.current.loading).toBe(false)
  })
})
