import { monaco as monacoEditor } from 'react-monaco-editor'

import { Nullable } from 'uiSrc/utils'
import { IEditorMount } from 'uiSrc/pages/workbench/interfaces'

export interface UseMonacoRedisEditorProps {
  monacoObjects: React.MutableRefObject<Nullable<IEditorMount>>
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
