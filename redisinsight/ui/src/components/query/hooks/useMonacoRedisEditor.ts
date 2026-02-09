import { useContext, useEffect, useRef } from 'react'
import { monaco as monacoEditor } from 'react-monaco-editor'

import { MonacoLanguage, Theme } from 'uiSrc/constants'
import { getMonacoAction, MonacoAction, Nullable } from 'uiSrc/utils'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { IEditorMount, ISnippetController } from 'uiSrc/pages/workbench/interfaces'

export interface UseMonacoRedisEditorProps {
  monacoObjects: React.RefObject<Nullable<IEditorMount>>
  onSubmit: (value?: string) => void
  onSetup?: (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: typeof monacoEditor,
  ) => void
}

export interface UseMonacoRedisEditorReturn {
  monacoTheme: string
  editorDidMount: (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: typeof monacoEditor,
  ) => void
  onExitSnippetMode: () => void
  triggerUpdateCursorPosition: (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
  ) => void
}

/**
 * Core editor lifecycle management:
 * - editorDidMount handler (stores refs, registers submit action, focus)
 * - snippet mode exit
 * - cursor position triggering
 * - theme resolution
 */
export const useMonacoRedisEditor = ({
  monacoObjects,
  onSubmit,
  onSetup,
}: UseMonacoRedisEditorProps): UseMonacoRedisEditorReturn => {
  const contributionRef = useRef<Nullable<ISnippetController>>(null)
  const { theme } = useContext(ThemeContext)

  const monacoTheme = theme === Theme.Dark ? 'dark' : 'light'

  const editorDidMount = (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: typeof monacoEditor,
  ) => {
    monacoObjects.current = { editor, monaco }

    // hack for exit from snippet mode after click Enter
    // https://github.com/microsoft/monaco-editor/issues/2756
    contributionRef.current =
      editor.getContribution<ISnippetController>('snippetController2')

    editor.focus()

    // Register Ctrl+Enter submit action
    editor.addAction(
      getMonacoAction(
        MonacoAction.Submit,
        (ed) => onSubmit(ed.getValue()),
        monaco,
      ),
    )

    // Allow consumers to do additional setup
    onSetup?.(editor, monaco)
  }

  const onExitSnippetMode = () => {
    if (!monacoObjects.current) return
    const { editor } = monacoObjects.current

    if (contributionRef.current?.isInSnippet?.()) {
      const { lineNumber = 0, column = 0 } = editor?.getPosition() ?? {}
      editor.setSelection(
        new monacoEditor.Selection(lineNumber, column, lineNumber, column),
      )
      contributionRef.current?.cancel?.()
    }
  }

  const triggerUpdateCursorPosition = (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
  ) => {
    const position = editor.getPosition()
    editor.trigger('mouse', '_moveTo', {
      position: { lineNumber: 1, column: 1 },
    })
    editor.trigger('mouse', '_moveTo', { position })
    editor.focus()
  }

  return {
    monacoTheme,
    editorDidMount,
    onExitSnippetMode,
    triggerUpdateCursorPosition,
  }
}
