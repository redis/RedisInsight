import * as reactRedux from 'react-redux'
import { renderHook, act } from '@testing-library/react-hooks'
import { EditorType } from 'uiSrc/slices/interfaces'
import { FeatureFlags } from 'uiSrc/constants'
import { stringToBuffer } from 'uiSrc/utils'
import { useChangeEditorType } from './useChangeEditorType'

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}))

jest.mock('uiSrc/slices/browser/rejson', () => ({
  ...jest.requireActual('uiSrc/slices/browser/rejson'),
  fetchReJSON: jest.fn((key) => ({ type: 'FETCH_REJSON', payload: key })),
}))

const mockedUseDispatch = reactRedux.useDispatch as jest.Mock
const mockedUseSelector = reactRedux.useSelector as jest.Mock
const mockKeyName = stringToBuffer('test-key')

describe('useChangeEditorType', () => {
  const dispatchMock = jest.fn()

  beforeEach(() => {
    mockedUseDispatch.mockReturnValue(dispatchMock)
    dispatchMock.mockClear()
  })

  it('should return opposite editor type correctly', () => {
    mockedUseSelector.mockReturnValue({
      editorType: EditorType.Default,
    })

    const { result } = renderHook(() => useChangeEditorType())

    expect(result.current.editorType).toBe(EditorType.Default)

    act(() => {
      result.current.switchEditorType()
    })

    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'rejson/setEditorType',
      payload: EditorType.Text,
    })
  })

  it('should return opposite editor type correctly when editorType is Text', () => {
    mockedUseSelector.mockReturnValue({
      editorType: EditorType.Text,
    })

    const { result } = renderHook(() => useChangeEditorType())

    expect(result.current.editorType).toBe(EditorType.Text)

    act(() => {
      result.current.switchEditorType()
    })

    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'rejson/setEditorType',
      payload: EditorType.Default,
    })
  })

  it('should fetch json when type switched', async () => {
    mockedUseSelector
      .mockReturnValue({
        editorType: EditorType.Default,
      })
      .mockReturnValue({
        [FeatureFlags.envDependent]: { flag: false },
      })
      .mockReturnValue({
        name: mockKeyName,
      })

    const { result } = renderHook(() => useChangeEditorType())

    act(() => {
      result.current.switchEditorType()
    })

    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'rejson/setEditorType',
      payload: EditorType.Default,
    })
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'FETCH_REJSON',
      payload: mockKeyName,
    })
  })

  it('should not fetch json when there is no selected key', () => {
    mockedUseSelector
      .mockReturnValue({
        editorType: EditorType.Default,
      })
      .mockReturnValue({
        [FeatureFlags.envDependent]: { flag: false },
      })

    const { result } = renderHook(() => useChangeEditorType())

    act(() => {
      result.current.switchEditorType()
    })

    expect(dispatchMock).not.toHaveBeenCalledWith({
      type: 'FETCH_REJSON',
      payload: expect.anything(),
    })
  })

  describe('isTextEditorDisabled', () => {
    it('should be false when isWithinThreshold is true', () => {
      mockedUseSelector
        .mockImplementationOnce(() => ({
          editorType: EditorType.Default,
          isWithinThreshold: true,
        }))
        .mockImplementationOnce(() => ({
          [FeatureFlags.envDependent]: { flag: false },
        }))

      const { result } = renderHook(() => useChangeEditorType())
      expect(result.current.isTextEditorDisabled).toBe(false)
    })

    it('should be false when not within threshold but feature flag is true', () => {
      mockedUseSelector
        .mockImplementationOnce(() => ({
          editorType: EditorType.Default,
          isWithinThreshold: false,
        }))
        .mockImplementationOnce(() => ({
          [FeatureFlags.envDependent]: { flag: true },
        }))

      const { result } = renderHook(() => useChangeEditorType())
      expect(result.current.isTextEditorDisabled).toBe(false)
    })

    it('should be true when not within threshold and feature flag is false', () => {
      mockedUseSelector
        .mockImplementationOnce(() => ({
          editorType: EditorType.Default,
          isWithinThreshold: false,
        }))
        .mockImplementationOnce(() => ({
          [FeatureFlags.envDependent]: { flag: false },
        }))

      const { result } = renderHook(() => useChangeEditorType())
      expect(result.current.isTextEditorDisabled).toBe(true)
    })

    it('should be true when envDependentFeature is undefined', () => {
      mockedUseSelector
        .mockImplementationOnce(() => ({
          editorType: EditorType.Default,
          isWithinThreshold: false,
        }))
        .mockImplementationOnce(() => ({
          [FeatureFlags.envDependent]: undefined,
        }))

      const { result } = renderHook(() => useChangeEditorType())
      expect(result.current.isTextEditorDisabled).toBe(true)
    })
  })
})
