import { renderHook, act } from '@testing-library/react-hooks'
import useMonacoValidation from './useMonacoValidation'

const monaco = {
  editor: {
    getModelMarkers: jest.fn(),
    onDidChangeMarkers: jest.fn(),
  },
} as any

const fakeModel = { uri: { toString: () => 'mock-uri' } }
const mockEditor = {
  getModel: () => fakeModel,
  onDidChangeModelContent: jest.fn(),
  onDidChangeModelDecorations: jest.fn(),
} as any

let markerListener: ((uris: any[]) => void) | undefined

beforeEach(() => {
  markerListener = undefined

  monaco.editor.getModelMarkers.mockReset()
  monaco.editor.onDidChangeMarkers.mockReset()
  mockEditor.onDidChangeModelContent.mockReset()

  monaco.editor.onDidChangeMarkers.mockImplementation((cb: any) => {
    markerListener = cb
    return { dispose: jest.fn() }
  })

  mockEditor.onDidChangeModelContent.mockImplementation((cb: any) => {
    mockEditor._contentChangeCallback = cb
    return { dispose: jest.fn() }
  })

  mockEditor.onDidChangeModelDecorations.mockImplementation((cb: any) => {
    mockEditor._decorationsChangeCallback = cb
    return { dispose: jest.fn() }
  })
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('useMonacoValidation', () => {
  it('returns valid = true when there are no markers', () => {
    monaco.editor.getModelMarkers.mockReturnValue([])

    const { result } = renderHook(() =>
      useMonacoValidation({ current: mockEditor }, monaco),
    )

    act(() => {
      mockEditor._contentChangeCallback()
    })
    act(() => {
      markerListener?.([fakeModel.uri])
    })

    expect(result.current.isValid).toBe(true)
    expect(result.current.isValidating).toBe(false)
  })

  it('returns valid = false when there is an error marker', () => {
    monaco.editor.getModelMarkers.mockReturnValue([{ severity: 8 }])

    const { result } = renderHook(() =>
      useMonacoValidation({ current: mockEditor }, monaco),
    )

    act(() => {
      mockEditor._contentChangeCallback()
    })
    act(() => {
      markerListener?.([fakeModel.uri])
    })

    expect(result.current.isValid).toBe(false)
    expect(result.current.isValidating).toBe(false)
  })

  it('returns isValidating = false if decorations change without marker changes', () => {
    let decorationsListener: (() => void) | undefined

    mockEditor.onDidChangeModelDecorations.mockImplementation((cb: any) => {
      decorationsListener = cb
      return { dispose: jest.fn() }
    })

    monaco.editor.getModelMarkers.mockReturnValue([])

    const { result } = renderHook(() =>
      useMonacoValidation({ current: mockEditor }, monaco),
    )

    act(() => {
      mockEditor._contentChangeCallback()
    })

    expect(result.current.isValidating).toBe(true)

    // Simulate formatting triggering decorations change
    act(() => {
      decorationsListener?.()
    })

    expect(result.current.isValidating).toBe(false)
  })
})
