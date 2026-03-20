import { act, renderHook } from '@testing-library/react-hooks'

import { REDIS_OPEN_TIMESTAMP_PICKER_COMMAND } from 'uiSrc/pages/workbench/constants'

import { useQueryEditorContext } from '../context/query-editor.context'
import { useQueryEditor } from './useQueryEditor'
import { useMonacoRedisEditor } from './useMonacoRedisEditor'
import { useRedisCompletions } from './useRedisCompletions'

jest.mock('../context/query-editor.context', () => ({
  useQueryEditorContext: jest.fn(),
}))

jest.mock('./useMonacoRedisEditor', () => ({
  useMonacoRedisEditor: jest.fn(),
}))

jest.mock('./useQueryDecorations', () => ({
  useQueryDecorations: jest.fn(),
}))

jest.mock('./useRedisCompletions', () => ({
  useRedisCompletions: jest.fn(),
}))

describe('useQueryEditor', () => {
  const mockDisposeProviders = jest.fn()
  const mockSetEscapedSuggestions = jest.fn()
  const mockTriggerUpdateCursorPosition = jest.fn()
  const mockExitSnippetMode = jest.fn()
  const mockRegisterCommand = jest.fn()

  const mockEditor = {
    addAction: jest.fn(),
    onKeyDown: jest.fn(),
    onDidChangeCursorPosition: jest.fn(),
  } as any

  const mockMonaco = {
    editor: {
      registerCommand: mockRegisterCommand,
    },
  } as any

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useQueryEditorContext as jest.Mock).mockReturnValue({
      monacoObjects: { current: null },
      query: 'SET key value EXAT 1',
      setQuery: jest.fn(),
      commands: [],
      indexes: [],
      activeIndexName: '',
      openTimestampPicker: jest.fn(),
    })
    ;(useRedisCompletions as jest.Mock).mockReturnValue({
      setupProviders: jest.fn(),
      disposeProviders: mockDisposeProviders,
      onTriggerParameterHints: jest.fn(),
      isSuggestionsOpened: jest.fn().mockReturnValue(false),
      setEscapedSuggestions: mockSetEscapedSuggestions,
      handleCursorChange: jest.fn(),
      setSuggestionsData: jest.fn(),
      getSuggestions: jest.fn().mockReturnValue({ data: [] }),
    })
    ;(useMonacoRedisEditor as jest.Mock).mockImplementation(({ onSetup }) => ({
      editorDidMount: (editor: any, monaco: any) => onSetup?.(editor, monaco),
      onExitSnippetMode: mockExitSnippetMode,
      triggerUpdateCursorPosition: mockTriggerUpdateCursorPosition,
    }))
  })

  it('should dispose the registered timestamp command on unmount', () => {
    const disposeCommand = jest.fn()
    mockRegisterCommand.mockReturnValue({ dispose: disposeCommand })

    const { result, unmount } = renderHook(() =>
      useQueryEditor({ onSubmit: jest.fn() }),
    )

    act(() => {
      result.current.editorDidMount(mockEditor, mockMonaco)
    })

    expect(mockRegisterCommand).toHaveBeenCalledWith(
      REDIS_OPEN_TIMESTAMP_PICKER_COMMAND,
      expect.any(Function),
    )

    unmount()

    expect(disposeCommand).toHaveBeenCalledTimes(1)
    expect(mockDisposeProviders).toHaveBeenCalledTimes(1)
  })

  it('should dispose the previous timestamp command before registering again', () => {
    const firstDisposeCommand = jest.fn()
    const secondDisposeCommand = jest.fn()

    mockRegisterCommand
      .mockReturnValueOnce({ dispose: firstDisposeCommand })
      .mockReturnValueOnce({ dispose: secondDisposeCommand })

    const { result, unmount } = renderHook(() =>
      useQueryEditor({ onSubmit: jest.fn() }),
    )

    act(() => {
      result.current.editorDidMount(mockEditor, mockMonaco)
    })

    act(() => {
      result.current.editorDidMount(mockEditor, mockMonaco)
    })

    expect(firstDisposeCommand).toHaveBeenCalledTimes(1)

    unmount()

    expect(secondDisposeCommand).toHaveBeenCalledTimes(1)
  })
})
