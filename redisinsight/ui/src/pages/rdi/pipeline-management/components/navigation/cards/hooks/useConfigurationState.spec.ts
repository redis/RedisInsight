import { renderHook } from 'uiSrc/utils/test-utils'
import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { IStateRdiPipeline, FileChangeType } from 'uiSrc/slices/interfaces'
import { useConfigurationState } from './useConfigurationState'

jest.mock('uiSrc/slices/rdi/pipeline', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/pipeline'),
  rdiPipelineSelector: jest.fn(),
}))

const mockRdiPipelineSelector = rdiPipelineSelector as jest.MockedFunction<
  typeof rdiPipelineSelector
>

type MockRdiPipelineState = Pick<
  IStateRdiPipeline,
  'changes' | 'configValidationErrors'
>

// Helper function to create mock state with only the properties we need
const createMockState = (state: MockRdiPipelineState): IStateRdiPipeline =>
  state as IStateRdiPipeline

describe('useConfigurationState', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return correct state when no changes and no validation errors', () => {
    mockRdiPipelineSelector.mockReturnValue(
      createMockState({
        changes: {},
        configValidationErrors: [],
      }),
    )

    const { result } = renderHook(() => useConfigurationState())

    expect(result.current).toEqual({
      hasChanges: false,
      isValid: true,
      configValidationErrors: [],
    })
  })

  it('should return hasChanges as true when config has changes', () => {
    mockRdiPipelineSelector.mockReturnValue(
      createMockState({
        changes: { config: FileChangeType.Modified },
        configValidationErrors: [],
      }),
    )

    const { result } = renderHook(() => useConfigurationState())

    expect(result.current).toEqual({
      hasChanges: true,
      isValid: true,
      configValidationErrors: [],
    })
  })

  it('should return isValid as false when config has validation errors', () => {
    mockRdiPipelineSelector.mockReturnValue(
      createMockState({
        changes: {},
        configValidationErrors: [
          'Invalid configuration',
          'Missing required field',
        ],
      }),
    )

    const { result } = renderHook(() => useConfigurationState())

    expect(result.current).toEqual({
      hasChanges: false,
      isValid: false,
      configValidationErrors: [
        'Invalid configuration',
        'Missing required field',
      ],
    })
  })

  it('should handle both changes and validation errors', () => {
    mockRdiPipelineSelector.mockReturnValue(
      createMockState({
        changes: { config: FileChangeType.Added },
        configValidationErrors: ['Configuration error'],
      }),
    )

    const { result } = renderHook(() => useConfigurationState())

    expect(result.current).toEqual({
      hasChanges: true,
      isValid: false,
      configValidationErrors: ['Configuration error'],
    })
  })

  it('should handle empty validation errors array', () => {
    mockRdiPipelineSelector.mockReturnValue(
      createMockState({
        changes: {},
        configValidationErrors: [],
      }),
    )

    const { result } = renderHook(() => useConfigurationState())

    expect(result.current.isValid).toBe(true)
  })

  it('should handle single validation error', () => {
    mockRdiPipelineSelector.mockReturnValue(
      createMockState({
        changes: {},
        configValidationErrors: ['Single error'],
      }),
    )

    const { result } = renderHook(() => useConfigurationState())

    expect(result.current).toEqual({
      hasChanges: false,
      isValid: false,
      configValidationErrors: ['Single error'],
    })
  })

  it('should handle multiple validation errors', () => {
    const errors = ['Error 1', 'Error 2', 'Error 3']
    mockRdiPipelineSelector.mockReturnValue(
      createMockState({
        changes: {},
        configValidationErrors: errors,
      }),
    )

    const { result } = renderHook(() => useConfigurationState())

    expect(result.current).toEqual({
      hasChanges: false,
      isValid: false,
      configValidationErrors: errors,
    })
  })

  it('should handle changes in other files without affecting config state', () => {
    mockRdiPipelineSelector.mockReturnValue(
      createMockState({
        changes: {
          job1: FileChangeType.Modified,
          job2: FileChangeType.Added,
          // no config changes
        },
        configValidationErrors: [],
      }),
    )

    const { result } = renderHook(() => useConfigurationState())

    expect(result.current.hasChanges).toBe(false)
  })
})
