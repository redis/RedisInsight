import { monaco as monacoEditor } from 'react-monaco-editor'

import { IRedisCommand } from 'uiSrc/constants'
import { IMonacoQuery, Nullable } from 'uiSrc/utils'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { IEditorMount } from 'uiSrc/pages/workbench/interfaces'

export interface UseRedisCompletionsProps {
  monacoObjects: React.RefObject<Nullable<IEditorMount>>
  commands: IRedisCommand[]
  indexes: RedisResponseBuffer[]
  activeIndexName?: string
}

export interface UseRedisCompletionsReturn {
  selectedIndex: string
  helpWidgetRef: React.MutableRefObject<{ isOpen: boolean; data: any }>
  compositeTokens: (string | undefined)[]
  getSuggestions: (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    command?: Nullable<IMonacoQuery>,
  ) => {
    forceHide: boolean
    forceShow: boolean
    data: monacoEditor.languages.CompletionItem[]
  }
  handleSuggestions: (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    command?: Nullable<IMonacoQuery>,
  ) => void
  onTriggerParameterHints: () => void
  triggerSuggestions: () => void
  isSuggestionsOpened: () => boolean
  setupProviders: (monaco: typeof monacoEditor) => void
  disposeProviders: () => void
  handleCursorChange: (
    e: monacoEditor.editor.ICursorPositionChangedEvent,
    isDedicatedEditorOpen?: boolean,
  ) => Nullable<IMonacoQuery>
  setupSuggestionWidgetListener: (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
  ) => void
  setSuggestionsData: (data: monacoEditor.languages.CompletionItem[]) => void
  setEscapedSuggestions: (value: boolean) => void
}
