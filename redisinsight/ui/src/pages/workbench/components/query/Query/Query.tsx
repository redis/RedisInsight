import React, { useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { monaco as monacoEditor } from 'react-monaco-editor'

import { MonacoLanguage } from 'uiSrc/constants'
import { CodeEditor } from 'uiSrc/components/base/code-editor'
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
  useCommandHistory,
  useDslSyntax,
  useQueryEditor,
} from 'uiSrc/components/query'
import { aroundQuotesRegExp, options, TUTORIALS } from './constants'
import { Props } from './Query.types'
import * as S from './Query.styles'

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

  const { monacoObjects, query, setQuery, isLoading, onSubmit } =
    useQueryEditorContext()

  const {
    items: execHistoryItems,
    loading,
    processing,
  } = useSelector(workbenchResultsSelector)

  const input = useRef<HTMLDivElement>(null)
  const dispatch = useDispatch()

  // Command history
  const { onQuickHistoryAccess, resetHistoryPos, isHistoryScrolled } =
    useCommandHistory({
      monacoObjects,
      historyItems: execHistoryItems,
    })

  function handleSubmit(value?: string) {
    resetHistoryPos()
    onSubmit(value)
  }

  const handleClear = () => {
    setQuery('')
    onClear?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    onKeyDown?.(e, query)
  }

  // Shared editor lifecycle with Workbench-specific extensions.
  // Note: dsl is declared after useQueryEditor but the callbacks below
  // only reference it lazily (at event time, not at call time), so the
  // closure captures the variable correctly after it's assigned.
  const { editorDidMount, onChange, triggerUpdateCursorPosition } =
    useQueryEditor({
      onSubmit: handleSubmit,

      shouldTriggerParameterHints: () =>
        !dsl.isDedicatedEditorOpenRef.current && !dsl.isWidgetOpen.current,

      isDedicatedEditorOpen: () =>
        dsl.isDedicatedEditorOpenRef.current ?? false,

      onSetup: (editor, monaco, completionsRef) => {
        setQueryEl(editor)
        dsl.setupDslCommands(editor, monaco)
        completionsRef.setupSuggestionWidgetListener(editor)
      },

      onKeyDown: (e) => {
        if (e.keyCode === monacoEditor.KeyCode.UpArrow) {
          onQuickHistoryAccess()
        }
      },

      onCursorChange: (e, command) => {
        dsl.handleDslSyntax(e, command)
      },

      onQueryChange: (value) => {
        if (value === '' && isHistoryScrolled()) {
          resetHistoryPos()
        }
      },

      onCleanup: () => dispatch(stopProcessing()),
    })

  // DSL syntax widget (Workbench-only)
  const dsl = useDslSyntax({
    monacoObjects,
    triggerUpdateCursorPosition,
  })

  const combinedIsLoading = isLoading || loading || processing

  return (
    <S.Wrapper>
      <S.Container
        $disabled={dsl.isDedicatedEditorOpen}
        onKeyDown={handleKeyDown}
        role="textbox"
        tabIndex={0}
        data-testid="main-input-container-area"
      >
        <S.InputContainer data-testid="query-input-container" ref={input}>
          <CodeEditor
            language={MonacoLanguage.Redis as string}
            value={query}
            options={options}
            className={`${MonacoLanguage.Redis}-editor`}
            onChange={onChange}
            editorDidMount={editorDidMount}
          />
        </S.InputContainer>
        <S.QueryFooter>
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
        </S.QueryFooter>
      </S.Container>
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
    </S.Wrapper>
  )
}

export default React.memo(Query)
