import React from 'react'
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api'

import { MonacoEditor } from 'uiSrc/components/monaco-editor'
import { CommonProps } from 'uiSrc/components/monaco-editor/MonacoEditor'

const MonacoJson = (props: CommonProps) => {
  const editorDidMount = (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: typeof monacoEditor,
  ) => {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemaValidation: 'error',
      schemaRequest: 'error',
      trailingCommas: 'error',
    })
    const messageContribution = editor.getContribution(
      'editor.contrib.messageController',
    )
    editor.onDidAttemptReadOnlyEdit(() => messageContribution?.dispose())
  }

  return (
    <MonacoEditor
      {...props}
      language="json"
      className="json-monaco-editor"
      onEditorDidMount={editorDidMount}
    />
  )
}

export default MonacoJson
