import { renderHook, act } from '@testing-library/react-hooks'
import executeQuery from 'uiSrc/services/executeQuery'
import {
  CreateSearchIndexParameters,
  SampleDataContent,
  SampleDataType,
  SearchIndexType,
} from '../types'
import { useCreateIndex } from './useCreateIndex'

const mockLoad = jest.fn()
const mockAddCommands = jest.fn()

jest.mock('uiSrc/services/hooks', () => ({
  useLoadData: () => ({
    load: mockLoad,
  }),
}))

jest.mock('uiSrc/services/workbenchStorage', () => ({
  addCommands: (...args: any[]) => mockAddCommands(...args),
}))

jest.mock('uiSrc/utils/index/generateFtCreateCommand', () => ({
  generateFtCreateCommand: () => 'FT.CREATE idx:bikes_vss ...',
}))

jest.mock('uiSrc/services/executeQuery', () => ({
  __esModule: true,
  default: jest.fn(),
}))
const mockExecute = executeQuery as jest.Mock
const mockOnSuccess = jest.fn()
const mockOnError = jest.fn()

describe('useCreateIndex', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const defaultParams: CreateSearchIndexParameters = {
    instanceId: 'test-instance-id',
    dataContent: SampleDataContent.E_COMMERCE_DISCOVERY,
    sampleDataType: SampleDataType.PRESET_DATA,
    searchIndexType: SearchIndexType.REDIS_QUERY_ENGINE,
    usePresetVectorIndex: true,
    indexName: 'bikes',
    indexFields: [],
  }

  it('should complete flow successfully', async () => {
    mockLoad.mockResolvedValue(undefined)
    mockExecute.mockResolvedValue([{ id: '1', databaseId: 'test-instance-id' }])

    const { result } = renderHook(() => useCreateIndex())

    await act(async () => {
      await result.current.run(defaultParams, mockOnSuccess, mockOnError)
    })

    expect(mockLoad).toHaveBeenCalledWith('test-instance-id', 'bikes')
    expect(mockExecute).toHaveBeenCalledWith(
      'test-instance-id',
      'FT.CREATE idx:bikes_vss ...',
    )
    expect(mockAddCommands).toHaveBeenCalled()
    expect(result.current.success).toBe(true)
    expect(result.current.error).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(mockOnSuccess).toHaveBeenCalled()
    expect(mockOnError).not.toHaveBeenCalled()
  })

  it('should handle error if instanceId is missing', async () => {
    const { result } = renderHook(() => useCreateIndex())

    await act(async () => {
      await result.current.run({ ...defaultParams, instanceId: '' })
    })

    expect(result.current.success).toBe(false)
    expect(result.current.error?.message).toMatch(/Instance ID is required/)
    expect(result.current.loading).toBe(false)
    expect(mockLoad).not.toHaveBeenCalled()
    expect(mockExecute).not.toHaveBeenCalled()
  })

  it('should handle failure in data loading', async () => {
    const error = new Error('Failed to load')
    mockLoad.mockRejectedValue(error)

    const { result } = renderHook(() => useCreateIndex())

    await act(async () => {
      await result.current.run(defaultParams, mockOnSuccess, mockOnError)
    })

    expect(mockLoad).toHaveBeenCalled()
    expect(result.current.success).toBe(false)
    expect(result.current.error).toBe(error)
    expect(result.current.loading).toBe(false)
    expect(mockExecute).not.toHaveBeenCalled()
    expect(mockOnSuccess).not.toHaveBeenCalled()
    expect(mockOnError).toHaveBeenCalled()
  })

  it('should handle execution failure', async () => {
    mockLoad.mockResolvedValue(undefined)
    mockExecute.mockRejectedValue(new Error('Execution failed'))

    const { result } = renderHook(() => useCreateIndex())

    await act(async () => {
      await result.current.run(defaultParams)
    })

    expect(mockExecute).toHaveBeenCalled()
    expect(result.current.success).toBe(false)
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toBe('Execution failed')
    expect(result.current.loading).toBe(false)
  })

  it('should handle movies data content correctly', async () => {
    const mockData = [{ id: '1', databaseId: 'test-instance-id' }]
    mockLoad.mockResolvedValue(undefined)
    mockExecute.mockResolvedValue(mockData)

    const { result } = renderHook(() => useCreateIndex())

    const moviesParams = {
      ...defaultParams,
      dataContent: SampleDataContent.CONTENT_RECOMMENDATIONS,
    }

    await act(async () => {
      await result.current.run(moviesParams)
    })

    expect(mockLoad).toHaveBeenCalledWith('test-instance-id', 'movies')
    expect(result.current.success).toBe(true)
  })
})
