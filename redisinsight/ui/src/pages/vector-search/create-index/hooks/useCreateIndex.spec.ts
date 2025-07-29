import { renderHook, act } from '@testing-library/react-hooks'
import { useCreateIndex } from './useCreateIndex'
import { SampleDataType, SearchIndexType } from '../types'

const mockLoad = jest.fn()
const mockDispatch = jest.fn()

jest.mock('uiSrc/services/hooks', () => ({
  useLoadData: () => ({
    load: mockLoad,
  }),
  useDispatchWbQuery: () => mockDispatch,
}))

jest.mock('uiSrc/utils/index/generateFtCreateCommand', () => ({
  generateFtCreateCommand: () => 'FT.CREATE idx:bikes_vss ...',
}))

describe('useCreateIndex', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const defaultParams = {
    dataContent: '',
    usePresetVectorIndex: true,
    presetVectorIndexName: '',
    tags: [],
    instanceId: 'test-instance-id',
    searchIndexType: SearchIndexType.REDIS_QUERY_ENGINE,
    sampleDataType: SampleDataType.PRESET_DATA,
  }

  it('should complete flow successfully', async () => {
    mockLoad.mockResolvedValue(undefined)
    mockDispatch.mockImplementation((_data, { afterAll }) => afterAll?.())

    const { result } = renderHook(() => useCreateIndex())

    await act(async () => {
      await result.current.run(defaultParams)
    })

    expect(mockLoad).toHaveBeenCalledWith('test-instance-id', 'bikes')
    expect(mockDispatch).toHaveBeenCalled()
    expect(result.current.success).toBe(true)
    expect(result.current.error).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  it('should handle error if instanceId is missing', async () => {
    const { result } = renderHook(() => useCreateIndex())

    await act(async () => {
      await result.current.run({ ...defaultParams, instanceId: '' })
    })

    expect(result.current.success).toBe(false)
    expect(result.current.error?.message).toMatch(/Instance ID is required/)
    expect(result.current.loading).toBe(false)
  })

  it('should handle failure in data loading', async () => {
    const error = new Error('Failed to load')
    mockLoad.mockRejectedValue(error)

    const { result } = renderHook(() => useCreateIndex())

    await act(async () => {
      await result.current.run(defaultParams)
    })

    expect(mockLoad).toHaveBeenCalled()
    expect(result.current.success).toBe(false)
    expect(result.current.error).toBe(error)
    expect(result.current.loading).toBe(false)
  })

  it('should handle dispatch failure', async () => {
    mockLoad.mockResolvedValue(undefined)
    mockDispatch.mockImplementation((_data, { onFail }) =>
      onFail?.(new Error('Dispatch failed')),
    )

    const { result } = renderHook(() => useCreateIndex())

    await act(async () => {
      await result.current.run(defaultParams)
    })

    expect(mockDispatch).toHaveBeenCalled()
    expect(result.current.success).toBe(false)
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toBe('Dispatch failed')
    expect(result.current.loading).toBe(false)
  })
})
