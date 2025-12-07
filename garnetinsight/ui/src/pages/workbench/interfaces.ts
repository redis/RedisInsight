import { monaco as monacoEditor } from 'react-monaco-editor'

export interface IEditorMount {
  editor: monacoEditor.editor.IStandaloneCodeEditor
  monaco: typeof monacoEditor
}

export interface ISnippetController
  extends monacoEditor.editor.IEditorContribution {
  isInSnippet: () => boolean
  finish: () => boolean
  cancel: () => boolean
}
