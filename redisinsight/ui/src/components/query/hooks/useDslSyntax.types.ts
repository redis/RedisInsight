import { monaco as monacoEditor } from 'react-monaco-editor'

import { IMonacoQuery, Nullable } from 'uiSrc/utils'
import { IEditorMount } from 'uiSrc/pages/workbench/interfaces'
import { MutableRefObject, RefObject } from 'react'

export interface UseDslSyntaxProps {
  monacoObjects: RefObject<Nullable<IEditorMount>>
  triggerUpdateCursorPosition: (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
  ) => void
}

export interface UseDslSyntaxReturn {
  isDedicatedEditorOpen: boolean
  isDedicatedEditorOpenRef: MutableRefObject<boolean>
  isWidgetOpen: MutableRefObject<boolean>
  selectedArg: MutableRefObject<string>
  syntaxCommand: MutableRefObject<Nullable<IMonacoQuery>>
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
