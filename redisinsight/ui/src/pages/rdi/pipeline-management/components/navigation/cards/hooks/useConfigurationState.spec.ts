import { renderHook } from 'uiSrc/utils/test-utils'
import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { useConfigurationState } from './useConfigurationState'

jest.mock('uiSrc/slices/rdi/pipeline', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/pipeline'),
  rdiPipelineSelector: jest.fn(),
}))

const mockRdiPipelineSelector = rdiPipelineSelector as jest.MockedFunction<
  typeof rdiPipelineSelector
>

describe('useConfigurationState', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return correct state when no changes and no validation errors', () => {
    mockRdiPipelineSelector.mockReturnValue({
      changes: {},
      configValidationErrors: [],
    } as any)

    const { result } = renderHook(() => useConfigurationState())

    expect(result.current).toEqual({
      hasChanges: false,
      isValid: true,
      configValidationErrors: [],
    })
  })

  it('should return hasChanges as true when config has changes', () => {
    mockRdiPipelineSelector.mockReturnValue({
      changes: { config: 'modified' },
      configValidationErrors: [],
    } as any)

    const { result } = renderHook(() => useConfigurationState())

    expect(result.current).toEqual({
      hasChanges: true,
      isValid: true,
      configValidationErrors: [],
    })
  })

  it('should return isValid as false when config has validation errors', () => {
    mockRdiPipelineSelector.mockReturnValue({
      changes: {},
      configValidationErrors: [
        'Invalid configuration',
        'Missing required field',
      ],
    } as any)

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
    mockRdiPipelineSelector.mockReturnValue({
      changes: { config: 'added' },
      configValidationErrors: ['Configuration error'],
    } as any)

    const { result } = renderHook(() => useConfigurationState())

    expect(result.current).toEqual({
      hasChanges: true,
      isValid: false,
      configValidationErrors: ['Configuration error'],
    })
  })

  it('should handle empty validation errors array', () => {
    mockRdiPipelineSelector.mockReturnValue({
      changes: {},
      configValidationErrors: [],
    } as any)

    const { result } = renderHook(() => useConfigurationState())

    expect(result.current.isValid).toBe(true)
  })

  it('should handle single validation error', () => {
    mockRdiPipelineSelector.mockReturnValue({
      changes: {},
      configValidationErrors: ['Single error'],
    } as any)

    const { result } = renderHook(() => useConfigurationState())

    expect(result.current).toEqual({
      hasChanges: false,
      isValid: false,
      configValidationErrors: ['Single error'],
    })
  })

  it('should handle multiple validation errors', () => {
    const errors = ['Error 1', 'Error 2', 'Error 3']
    mockRdiPipelineSelector.mockReturnValue({
      changes: {},
      configValidationErrors: errors,
    } as any)

    const { result } = renderHook(() => useConfigurationState())

    expect(result.current).toEqual({
      hasChanges: false,
      isValid: false,
      configValidationErrors: errors,
    })
  })

  it('should handle changes in other files without affecting config state', () => {
    mockRdiPipelineSelector.mockReturnValue({
      changes: {
        job1: 'modified',
        job2: 'added',
        // no config changes
      },
      configValidationErrors: [],
    } as any)

    const { result } = renderHook(() => useConfigurationState())

    expect(result.current.hasChanges).toBe(false)
  })
})
