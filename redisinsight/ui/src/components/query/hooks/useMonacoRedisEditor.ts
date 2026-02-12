import { useRef } from 'react'
import { monaco as monacoEditor } from 'react-monaco-editor'

import { getMonacoAction, MonacoAction, Nullable } from 'uiSrc/utils'
import { ISnippetController } from 'uiSrc/pages/workbench/interfaces'

import {
  UseMonacoRedisEditorProps,
  UseMonacoRedisEditorReturn,
} from './useMonacoRedisEditor.types'

/**
 * Core editor lifecycle management:
 * - editorDidMount handler (stores refs, registers submit action, focus)
 * - snippet mode exit
 * - cursor position triggering
 */
export const useMonacoRedisEditor = ({
  monacoObjects,
  onSubmit,
  onSetup,
}: UseMonacoRedisEditorProps): UseMonacoRedisEditorReturn => {
  const contributionRef = useRef<Nullable<ISnippetController>>(null)

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
    editorDidMount,
    onExitSnippetMode,
    triggerUpdateCursorPosition,
  }
}
