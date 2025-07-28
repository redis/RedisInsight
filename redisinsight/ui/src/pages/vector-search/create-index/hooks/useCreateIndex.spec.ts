import { renderHook, act } from '@testing-library/react-hooks'
import { useDispatchWbQuery as mockedUseDispatchWbQuery } from 'uiSrc/services/hooks/useDispatchWbQuery'
import { useCreateIndex } from './useCreateIndex'
import { SampleDataType, SearchIndexType } from '../types'

const mockLoad = jest.fn()

jest.mock('uiSrc/services/hooks/useLoadData', () => ({
  useLoadData: () => ({
    load: mockLoad,
  }),
}))

jest.mock('uiSrc/services/hooks/useDispatchWbQuery')

jest.mock('uiSrc/utils/index/generateFtCreateCommand', () => ({
  generateFtCreateCommand: () => 'FT.CREATE idx:bikes_vss ...',
}))

const mockUseDispatchWbQuery = mockedUseDispatchWbQuery as jest.Mock

describe('useCreateIndex', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should complete index creation flow successfully', async () => {
    mockLoad.mockResolvedValue('HSET bikes:1 ...')

    const bulkDispatch = jest.fn(
      (_data: string, { afterAll }: { afterAll?: () => void }) => afterAll?.(),
    )
    const createDispatch = jest.fn(
      (_data: string, { afterAll }: { afterAll?: () => void }) => afterAll?.(),
    )

    mockUseDispatchWbQuery
      .mockReturnValueOnce(bulkDispatch)
      .mockReturnValueOnce(createDispatch)

    const { result } = renderHook(() => useCreateIndex())

    await act(async () =>
      result.current.run({
        dataContent: '',
        usePresetVectorIndex: true,
        presetVectorIndexName: '',
        tags: [],
        instanceId: '',
        searchIndexType: SearchIndexType.REDIS_QUERY_ENGINE,
        sampleDataType: SampleDataType.PRESET_DATA,
      }),
    )

    expect(mockLoad).toHaveBeenCalled()
    expect(bulkDispatch).toHaveBeenCalled()
    expect(createDispatch).toHaveBeenCalled()
    expect(result.current.error).toBeNull()
    expect(result.current.success).toBe(true)
    expect(result.current.loading).toBe(false)
  })

  it('should handle load failure', async () => {
    mockLoad.mockRejectedValue(new Error('Failed to load file'))

    const { result } = renderHook(() => useCreateIndex())

    await act(async () => {
      await result.current.run({} as any)
    })

    expect(result.current.error?.message).toBe('Failed to load file')
    expect(result.current.success).toBe(false)
    expect(result.current.loading).toBe(false)
  })

  it('should handle dispatch failure (FT.CREATE)', async () => {
    mockLoad.mockResolvedValue('HSET bikes:1 valid')

    const bulkDispatch = jest.fn((_data, { afterAll }) => afterAll?.())
    const createDispatch = jest.fn((_data, { onFail }) => onFail?.())

    mockUseDispatchWbQuery
      .mockReturnValueOnce(bulkDispatch)
      .mockReturnValueOnce(createDispatch)

    const { result } = renderHook(() => useCreateIndex())

    await act(async () => {
      await result.current.run({} as any)
    })

    expect(bulkDispatch).toHaveBeenCalled()
    expect(createDispatch).toHaveBeenCalled()
    expect(result.current.success).toBe(false)
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.loading).toBe(false)
  })
})
