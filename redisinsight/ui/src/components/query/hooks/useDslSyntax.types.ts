import { MutableRefObject, RefObject } from 'react'
import { monaco as monacoEditor } from 'react-monaco-editor'

import { IMonacoQuery, Nullable } from 'uiSrc/utils'
import { IEditorMount } from 'uiSrc/pages/workbench/interfaces'

export interface UseDslSyntaxProps {
  monacoObjects: RefObject<Nullable<IEditorMount>>
}

export interface UseDslSyntaxReturn {
  isDedicatedEditorOpen: boolean
  isDedicatedEditorOpenRef: MutableRefObject<boolean>
  isWidgetOpen: MutableRefObject<boolean>
  selectedArg: MutableRefObject<string>
  syntaxCommand: MutableRefObject<Nullable<IMonacoQuery>>
  setupDslCommands: (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: typeof monacoEditor,
  ) => void
  /** Hide the DSL widget if visible. Call before suggestion logic. */
  hideWidget: () => void
  handleDslSyntax: (
    e: monacoEditor.editor.ICursorPositionChangedEvent,
    command: Nullable<IMonacoQuery>,
  ) => void
  onPressWidget: () => void
  onCancelDedicatedEditor: () => void
  updateArgFromDedicatedEditor: (value?: string) => void
}
