import { monaco as monacoEditor } from 'react-monaco-editor'

import { IMonacoQuery, Nullable } from 'uiSrc/utils'
import { IEditorMount } from 'uiSrc/pages/workbench/interfaces'

export interface UseDslSyntaxProps {
  monacoObjects: React.RefObject<Nullable<IEditorMount>>
  triggerUpdateCursorPosition: (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
  ) => void
}

export interface UseDslSyntaxReturn {
  isDedicatedEditorOpen: boolean
  isDedicatedEditorOpenRef: React.MutableRefObject<boolean>
  selectedArg: React.MutableRefObject<string>
  syntaxCommand: React.MutableRefObject<any>
  aroundQuotesRegExp: RegExp
  setupDslCommands: (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: typeof monacoEditor,
  ) => void
  handleDslSyntax: (
    e: monacoEditor.editor.ICursorPositionChangedEvent,
    command: Nullable<IMonacoQuery>,
  ) => void
  onPressWidget: () => void
  onCancelDedicatedEditor: () => void
  updateArgFromDedicatedEditor: (value?: string) => void
}
