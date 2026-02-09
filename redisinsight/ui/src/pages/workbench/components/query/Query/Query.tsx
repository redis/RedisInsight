import React, { useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import MonacoEditor, { monaco as monacoEditor } from 'react-monaco-editor'

import { MonacoLanguage } from 'uiSrc/constants'
import { EmptySuggestionsIds } from 'uiSrc/pages/workbench/constants'
import {
  stopProcessing,
  workbenchResultsSelector,
} from 'uiSrc/slices/workbench/wb-results'
import DedicatedEditor from 'uiSrc/components/monaco-editor/components/dedicated-editor'
import {
  QueryActions,
  QueryTutorials,
  QueryLiteActions,
  useQueryEditorContext,
  useMonacoRedisEditor,
  useRedisCompletions,
  useQueryDecorations,
  useCommandHistory,
  useDslSyntax,
} from 'uiSrc/components/query'
import { ResultsMode, RunQueryMode } from 'uiSrc/slices/interfaces/workbench'

import { aroundQuotesRegExp, options, TUTORIALS } from './constants'
import styles from './styles.module.scss'

export interface Props {
  activeMode: RunQueryMode
  resultsMode?: ResultsMode
  useLiteActions?: boolean
  setQueryEl?: Function
  onKeyDown?: (e: React.KeyboardEvent, script: string) => void
  onQueryChangeMode: () => void
  onChangeGroupMode: () => void
  onClear?: () => void
}

const Query = (props: Props) => {
  const {
    activeMode,
    resultsMode,
    useLiteActions = false,
    setQueryEl = () => {},
    onKeyDown = () => {},
    onQueryChangeMode = () => {},
    onChangeGroupMode = () => {},
    onClear = () => {},
  } = props

  const {
    monacoObjects,
    query,
    setQuery,
    commands,
    indexes,
    isLoading,
    onSubmit,
  } = useQueryEditorContext()

  const {
    items: execHistoryItems,
    loading,
    processing,
  } = useSelector(workbenchResultsSelector)

  const input = useRef<HTMLDivElement>(null)
  const dispatch = useDispatch()

  // Core editor lifecycle
  const {
    monacoTheme,
    editorDidMount: baseEditorDidMount,
    onExitSnippetMode,
    triggerUpdateCursorPosition,
  } = useMonacoRedisEditor({
    monacoObjects,
    onSubmit: handleSubmit,
    onSetup: handleEditorSetup,
  })

  // Autocomplete & suggestions
  const completions = useRedisCompletions({
    monacoObjects,
    commands,
    indexes,
  })

  // Decorations
  useQueryDecorations({ monacoObjects, query })

  // Command history
  const { onQuickHistoryAccess, resetHistoryPos, isHistoryScrolled } =
    useCommandHistory({
      monacoObjects,
      historyItems: execHistoryItems,
    })

  // DSL syntax widget (Workbench-only)
  const dsl = useDslSyntax({
    monacoObjects,
    triggerUpdateCursorPosition,
  })

  // Cleanup on unmount
  React.useEffect(
    () => () => {
      dispatch(stopProcessing())
      completions.disposeProviders()
    },
    [],
  )

  function handleEditorSetup(
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: typeof monacoEditor,
  ) {
    setQueryEl(editor)

    // Register language providers
    completions.setupProviders(monaco)

    // DSL widget commands
    dsl.setupDslCommands(editor, monaco)

    // Key handlers
    editor.onKeyDown(onKeyDownMonaco)
    editor.onDidChangeCursorPosition(onKeyChangeCursorMonaco)

    // Suggestion widget listener
    const suggestionWidget = editor.getContribution<any>(
      'editor.contrib.suggestController',
    )
    suggestionWidget?.onWillInsertSuggestItem(
      ({ item }: Record<'item', any>) => {
        if (item.completion.id === EmptySuggestionsIds.NoIndexes) {
          if (completions.helpWidgetRef.current) {
            completions.helpWidgetRef.current.isOpen = true
          }
          editor.trigger('', 'hideSuggestWidget', null)
          editor.trigger('', 'editor.action.triggerParameterHints', '')
        }
      },
    )

    // Initial suggestions
    completions.setSuggestionsData(completions.getSuggestions(editor).data)
  }

  const onChange = (value: string = '') => {
    setQuery(value)

    // clear history position after scrolling all list with empty value
    if (value === '' && isHistoryScrolled()) {
      resetHistoryPos()
    }
  }

  const onKeyDownMonaco = (e: monacoEditor.IKeyboardEvent) => {
    // trigger parameter hints
    if (
      e.keyCode === monacoEditor.KeyCode.Tab ||
      e.keyCode === monacoEditor.KeyCode.Enter ||
      (e.keyCode === monacoEditor.KeyCode.Space && e.ctrlKey && e.shiftKey) ||
      (e.keyCode === monacoEditor.KeyCode.Space && !e.ctrlKey && !e.shiftKey)
    ) {
      if (!dsl.isDedicatedEditorOpenRef.current) {
        completions.onTriggerParameterHints()
      }
    }

    if (e.keyCode === monacoEditor.KeyCode.UpArrow) {
      onQuickHistoryAccess()
    }

    if (
      e.keyCode === monacoEditor.KeyCode.Enter ||
      e.keyCode === monacoEditor.KeyCode.Space
    ) {
      onExitSnippetMode()
    }

    if (
      e.keyCode === monacoEditor.KeyCode.Escape &&
      completions.isSuggestionsOpened()
    ) {
      completions.setEscapedSuggestions(true)
    }
  }

  const onKeyChangeCursorMonaco = (
    e: monacoEditor.editor.ICursorPositionChangedEvent,
  ) => {
    if (!monacoObjects.current) return

    const command = completions.handleCursorChange(
      e,
      dsl.isDedicatedEditorOpenRef.current ?? false,
    )
    if (command) {
      dsl.handleDslSyntax(e, command)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    onKeyDown?.(e, query)
  }

  function handleSubmit(value?: string) {
    resetHistoryPos()
    onSubmit(value)
  }

  const handleClear = () => {
    setQuery('')
    onClear?.()
  }

  const combinedIsLoading = isLoading || loading || processing

  return (
    <div className={styles.wrapper}>
      <div
        className={cx(styles.container, {
          [styles.disabled]: dsl.isDedicatedEditorOpen,
        })}
        onKeyDown={handleKeyDown}
        role="textbox"
        tabIndex={0}
        data-testid="main-input-container-area"
      >
        <div
          className={styles.input}
          data-testid="query-input-container"
          ref={input}
        >
          <MonacoEditor
            language={MonacoLanguage.Redis as string}
            theme={monacoTheme}
            value={query}
            options={options}
            className={`${MonacoLanguage.Redis}-editor`}
            onChange={onChange}
            editorDidMount={baseEditorDidMount}
          />
        </div>
        <div className={styles.queryFooter}>
          {useLiteActions ? (
            <QueryLiteActions
              isLoading={combinedIsLoading}
              onSubmit={handleSubmit}
              onClear={handleClear}
            />
          ) : (
            <>
              <QueryTutorials
                tutorials={TUTORIALS}
                source="advanced_workbench_editor"
              />
              <QueryActions
                isLoading={combinedIsLoading}
                activeMode={activeMode}
                resultsMode={resultsMode}
                onChangeGroupMode={onChangeGroupMode}
                onChangeMode={onQueryChangeMode}
                onSubmit={handleSubmit}
              />
            </>
          )}
        </div>
      </div>
      {dsl.isDedicatedEditorOpen && (
        <DedicatedEditor
          initialHeight={input?.current?.scrollHeight || 0}
          langId={dsl.syntaxCommand.current.lang}
          query={(dsl.selectedArg.current || '').replace(
            aroundQuotesRegExp,
            '',
          )}
          onSubmit={dsl.updateArgFromDedicatedEditor}
          onCancel={dsl.onCancelDedicatedEditor}
        />
      )}
    </div>
  )
}

export default React.memo(Query)
