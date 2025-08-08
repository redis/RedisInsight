import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { compact, first } from 'lodash'
import cx from 'classnames'
import MonacoEditor, { monaco as monacoEditor } from 'react-monaco-editor'
import { useParams } from 'react-router-dom'

import {
  DSLNaming,
  IRedisCommand,
  MonacoLanguage,
  Theme,
} from 'uiSrc/constants'
import {
  actionTriggerParameterHints,
  createSyntaxWidget,
  decoration,
  findCompleteQuery,
  getMonacoAction,
  IMonacoQuery,
  isParamsLine,
  MonacoAction,
  Nullable,
  toModelDeltaDecoration,
} from 'uiSrc/utils'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { appRedisCommandsSelector } from 'uiSrc/slices/app/redis-commands'
import {
  IEditorMount,
  ISnippetController,
} from 'uiSrc/pages/workbench/interfaces'
import {
  CommandExecutionUI,
  RedisResponseBuffer,
} from 'uiSrc/slices/interfaces'
import { ResultsMode, RunQueryMode } from 'uiSrc/slices/interfaces/workbench'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  stopProcessing,
  workbenchResultsSelector,
} from 'uiSrc/slices/workbench/wb-results'
import DedicatedEditor from 'uiSrc/components/monaco-editor/components/dedicated-editor'
import {
  QueryActions,
  QueryTutorials,
  QueryLiteActions,
} from 'uiSrc/components/query'

import {
  getRange,
  getRediSearchSignutureProvider,
} from 'uiSrc/pages/workbench/utils/monaco'
import { CursorContext } from 'uiSrc/pages/workbench/types'
import {
  asSuggestionsRef,
  getCommandsSuggestions,
  isIndexComplete,
} from 'uiSrc/pages/workbench/utils/suggestions'
import {
  COMMANDS_TO_GET_INDEX_INFO,
  COMPOSITE_ARGS,
  EmptySuggestionsIds,
} from 'uiSrc/pages/workbench/constants'
import { useDebouncedEffect } from 'uiSrc/services'
import { fetchRedisearchInfoAction } from 'uiSrc/slices/browser/redisearch'
import { findSuggestionsByArg } from 'uiSrc/pages/workbench/utils/searchSuggestions'
import { findSuggestionsByQueryArgs } from 'uiSrc/pages/workbench/utils/query'
import {
  argInQuotesRegExp,
  aroundQuotesRegExp,
  options,
  SYNTAX_CONTEXT_ID,
  SYNTAX_WIDGET_ID,
  TUTORIALS,
} from './constants'
import styles from './styles.module.scss'

export interface Props {
  query: string
  commands: IRedisCommand[]
  indexes: RedisResponseBuffer[]
  activeMode: RunQueryMode
  resultsMode?: ResultsMode
  setQueryEl: Function
  useLiteActions?: boolean
  setQuery: (script: string) => void
  onSubmit: (query?: string) => void
  onKeyDown?: (e: React.KeyboardEvent, script: string) => void
  onQueryChangeMode: () => void
  onChangeGroupMode: () => void
  onClear?: () => void
}

let execHistoryPos: number = 0
let execHistory: CommandExecutionUI[] = []
let decorationCollection: Nullable<monacoEditor.editor.IEditorDecorationsCollection> =
  null

const Query = (props: Props) => {
  const {
    query = '',
    commands = [],
    indexes = [],
    activeMode,
    resultsMode,
    useLiteActions = false,
    setQuery = () => {},
    onKeyDown = () => {},
    onSubmit = () => {},
    setQueryEl = () => {},
    onQueryChangeMode = () => {},
    onChangeGroupMode = () => {},
    onClear = () => {},
  } = props
  let contribution: Nullable<ISnippetController> = null
  const [isDedicatedEditorOpen, setIsDedicatedEditorOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState('')

  const suggestionsRef = useRef<monacoEditor.languages.CompletionItem[]>([])
  const helpWidgetRef = useRef<any>({
    isOpen: false,
    data: {},
  })
  const indexesRef = useRef<RedisResponseBuffer[]>([])
  const attributesRef = useRef<any>([])

  const isWidgetOpen = useRef(false)
  const input = useRef<HTMLDivElement>(null)
  const isWidgetEscaped = useRef(false)
  const selectedArg = useRef('')
  const syntaxCommand = useRef<any>(null)
  const isDedicatedEditorOpenRef = useRef<boolean>(isDedicatedEditorOpen)
  const isEscapedSuggestions = useRef<boolean>(false)
  let syntaxWidgetContext: Nullable<monacoEditor.editor.IContextKey<boolean>> =
    null

  const { commandsArray: REDIS_COMMANDS_ARRAY, spec: REDIS_COMMANDS_SPEC } =
    useSelector(appRedisCommandsSelector)
  const {
    items: execHistoryItems,
    loading,
    processing,
  } = useSelector(workbenchResultsSelector)
  const { theme } = useContext(ThemeContext)
  const monacoObjects = useRef<Nullable<IEditorMount>>(null)

  const compositeTokens = useMemo(
    () =>
      commands
        .filter((command) => command.token && command.token.includes(' '))
        .map(({ token }) => token)
        .concat(...COMPOSITE_ARGS),
    [commands],
  )

  const { instanceId = '' } = useParams<{ instanceId: string }>()

  const dispatch = useDispatch()

  let disposeCompletionItemProvider = () => {}
  let disposeSignatureHelpProvider = () => {}

  useEffect(
    () =>
      // componentWillUnmount
      () => {
        dispatch(stopProcessing())
        contribution?.dispose?.()
        disposeCompletionItemProvider()
        disposeSignatureHelpProvider()
      },
    [],
  )

  useEffect(() => {
    indexesRef.current = indexes
  }, [indexes])

  useEffect(() => {
    // HACK: The Monaco editor memoize the state and ignores updates to it
    execHistory = execHistoryItems
    execHistoryPos = 0
  }, [execHistoryItems])

  useEffect(() => {
    if (!monacoObjects.current) return
    const commands = query.split('\n')
    const firstLine = first(commands) ?? ''
    const { monaco } = monacoObjects.current
    const notCommandRegEx = /^[\s|//]/

    const newDecorations = compact(
      commands.map((command, index) => {
        if (
          !command ||
          notCommandRegEx.test(command) ||
          (index === 0 && isParamsLine(command))
        )
          return null
        const lineNumber = index + 1

        return toModelDeltaDecoration(
          decoration(
            monaco,
            `decoration_${lineNumber}`,
            lineNumber,
            1,
            lineNumber,
            1,
          ),
        )
      }),
    )

    // highlight the first line with params
    if (isParamsLine(firstLine)) {
      newDecorations.push({
        range: new monaco.Range(1, 1, 1, firstLine.indexOf(']') + 2),
        options: { inlineClassName: 'monaco-params-line' },
      })
    }

    decorationCollection?.set(newDecorations)
  }, [query])

  useEffect(() => {
    isDedicatedEditorOpenRef.current = isDedicatedEditorOpen
  }, [isDedicatedEditorOpen])

  useDebouncedEffect(
    () => {
      attributesRef.current = []
      if (!isIndexComplete(selectedIndex)) return

      const index = selectedIndex.replace(/^(['"])(.*)\1$/, '$2')
      dispatch(
        fetchRedisearchInfoAction(index, (data: any) => {
          attributesRef.current = data?.attributes || []
        }),
      )
    },
    200,
    [selectedIndex],
  )

  const editorDidMount = (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: typeof monacoEditor,
  ) => {
    monacoObjects.current = { editor, monaco }

    // hack for exit from snippet mode after click Enter until no answer from monaco authors
    // https://github.com/microsoft/monaco-editor/issues/2756
    contribution =
      editor.getContribution<ISnippetController>('snippetController2')

    syntaxWidgetContext = editor.createContextKey(SYNTAX_CONTEXT_ID, false)
    editor.focus()
    setQueryEl(editor)

    editor.onKeyDown(onKeyDownMonaco)
    editor.onDidChangeCursorPosition(onKeyChangeCursorMonaco)

    setupMonacoRedisLang(monaco)
    editor.addAction(
      getMonacoAction(
        MonacoAction.Submit,
        (editor) => handleSubmit(editor.getValue()),
        monaco,
      ),
    )

    editor.addCommand(
      monaco.KeyMod.Shift | monaco.KeyCode.Space,
      () => {
        onPressWidget()
      },
      SYNTAX_CONTEXT_ID,
    )

    editor.onMouseDown((e: monacoEditor.editor.IEditorMouseEvent) => {
      if (
        (e.target as monacoEditor.editor.IMouseTargetContentWidget)?.detail ===
        SYNTAX_WIDGET_ID
      ) {
        onPressWidget()
      }
    })

    editor.addCommand(
      monaco.KeyCode.Escape,
      () => {
        hideSyntaxWidget(editor)
        isWidgetEscaped.current = true
      },
      SYNTAX_CONTEXT_ID,
    )

    decorationCollection = editor.createDecorationsCollection()

    const suggestionWidget = editor.getContribution<any>(
      'editor.contrib.suggestController',
    )
    suggestionWidget?.onWillInsertSuggestItem(
      ({ item }: Record<'item', any>) => {
        if (item.completion.id === EmptySuggestionsIds.NoIndexes) {
          helpWidgetRef.current.isOpen = true
          editor.trigger('', 'hideSuggestWidget', null)
          editor.trigger('', 'editor.action.triggerParameterHints', '')
        }
      },
    )
    suggestionsRef.current = getSuggestions(editor).data
  }

  const onChange = (value: string = '') => {
    setQuery(value)

    // clear history position after scrolling all list with empty value
    if (value === '' && execHistoryPos >= execHistory.length) {
      execHistoryPos = 0
    }
  }

  const onTriggerParameterHints = () => {
    if (!monacoObjects.current) return

    const { editor } = monacoObjects?.current
    const model = editor.getModel()
    const { lineNumber = 0 } = editor.getPosition() ?? {}
    const lineContent = model?.getLineContent(lineNumber)?.trim() ?? ''
    const matchedCommand =
      REDIS_COMMANDS_ARRAY.find((command) =>
        lineContent?.trim().startsWith(command),
      ) ?? ''
    // trigger parameter hints only ones between command and arguments in the same line
    const isTriggerHints =
      lineContent.split(' ').length < 2 + matchedCommand.split(' ').length

    if (isTriggerHints && !isWidgetOpen.current) {
      actionTriggerParameterHints(editor)
    }
  }

  const onTriggerContentWidget = (
    position: Nullable<monacoEditor.Position>,
    language: string = '',
  ): monacoEditor.editor.IContentWidget => ({
    getId: () => SYNTAX_WIDGET_ID,
    getDomNode: () =>
      createSyntaxWidget(`Use ${language} Editor`, 'Shift+Space'),
    getPosition: () => ({
      position,
      preference: [monacoEditor.editor.ContentWidgetPositionPreference.BELOW],
    }),
  })

  const onQuickHistoryAccess = () => {
    if (!monacoObjects.current) return
    const { editor } = monacoObjects?.current

    const position = editor.getPosition()
    if (
      position?.column !== 1 ||
      position?.lineNumber !== 1 ||
      // @ts-ignore
      editor.getContribution('editor.contrib.suggestController')?.model?.state
    )
      return

    if (execHistory[execHistoryPos]) {
      const command = execHistory[execHistoryPos].command || ''
      editor.setValue(command)
      execHistoryPos++
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
      onTriggerParameterHints()
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

    if (e.keyCode === monacoEditor.KeyCode.Escape && isSuggestionsOpened()) {
      isEscapedSuggestions.current = true
    }
  }

  const onExitSnippetMode = () => {
    if (!monacoObjects.current) return
    const { editor } = monacoObjects?.current

    if (contribution?.isInSnippet?.()) {
      const { lineNumber = 0, column = 0 } = editor?.getPosition() ?? {}
      editor.setSelection(
        new monacoEditor.Selection(lineNumber, column, lineNumber, column),
      )
      contribution?.cancel?.()
    }
  }

  const onKeyChangeCursorMonaco = (
    e: monacoEditor.editor.ICursorPositionChangedEvent,
  ) => {
    if (!monacoObjects.current) return
    const { editor } = monacoObjects?.current
    const model = editor.getModel()

    isWidgetOpen.current && hideSyntaxWidget(editor)

    if (!model || isDedicatedEditorOpenRef.current) {
      return
    }

    const command = findCompleteQuery(
      model,
      e.position,
      REDIS_COMMANDS_SPEC,
      REDIS_COMMANDS_ARRAY,
      compositeTokens as string[],
    )
    handleSuggestions(editor, command)
    handleDslSyntax(e, command)
  }

  const onPressWidget = () => {
    if (!monacoObjects.current) return
    const { editor } = monacoObjects?.current

    setIsDedicatedEditorOpen(true)
    editor.updateOptions({ readOnly: true })
    hideSyntaxWidget(editor)
    sendEventTelemetry({
      event: TelemetryEvent.WORKBENCH_NON_REDIS_EDITOR_OPENED,
      eventData: {
        databaseId: instanceId,
        lang: syntaxCommand.current.lang,
      },
    })
  }

  const onCancelDedicatedEditor = () => {
    setIsDedicatedEditorOpen(false)
    if (!monacoObjects.current) return
    const { editor } = monacoObjects?.current

    editor.updateOptions({ readOnly: false })
    triggerUpdateCursorPosition(editor)

    sendEventTelemetry({
      event: TelemetryEvent.WORKBENCH_NON_REDIS_EDITOR_CANCELLED,
      eventData: {
        databaseId: instanceId,
        lang: syntaxCommand.current.lang,
      },
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    onKeyDown?.(e, query)
  }

  const handleSubmit = (value?: string) => {
    execHistoryPos = 0
    onSubmit(value)
  }

  const handleClear = () => {
    setQuery('')
    onClear?.()
  }

  const handleSuggestions = (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    command?: Nullable<IMonacoQuery>,
  ) => {
    const { data, forceHide, forceShow } = getSuggestions(editor, command)
    suggestionsRef.current = data

    if (!forceShow) {
      editor.trigger('', 'editor.action.triggerParameterHints', '')
      return
    }

    if (data.length) {
      helpWidgetRef.current.isOpen = false
      triggerSuggestions()
      return
    }

    editor.trigger('', 'editor.action.triggerParameterHints', '')

    if (forceHide) {
      setTimeout(() => editor?.trigger('', 'hideSuggestWidget', null), 0)
    } else {
      helpWidgetRef.current.isOpen =
        !isSuggestionsOpened() && helpWidgetRef.current.isOpen
    }
  }

  const handleDslSyntax = (
    e: monacoEditor.editor.ICursorPositionChangedEvent,
    command: Nullable<IMonacoQuery>,
  ) => {
    const { editor } = monacoObjects?.current || {}
    if (!command?.info || !editor) {
      isWidgetEscaped.current = false
      return
    }

    const isContainsDSL = command.info?.arguments?.some((arg) => arg.dsl)
    if (!isContainsDSL) {
      isWidgetEscaped.current = false
      return
    }

    const [beforeOffsetArgs, [currentOffsetArg]] = command.args
    const foundArg = findSuggestionsByQueryArgs(
      [{ ...command.info, token: command.name }],
      beforeOffsetArgs,
    )

    const DSL = foundArg?.stopArg?.dsl
    if (DSL && argInQuotesRegExp.test(currentOffsetArg)) {
      if (isWidgetEscaped.current) return

      const lang = DSLNaming[DSL] ?? null
      lang && showSyntaxWidget(editor, e.position, lang)
      selectedArg.current = currentOffsetArg
      syntaxCommand.current = {
        ...command,
        lang: DSL,
        argToReplace: currentOffsetArg,
      }
    } else {
      isWidgetEscaped.current = false
    }
  }

  const triggerUpdateCursorPosition = (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
  ) => {
    const position = editor.getPosition()
    isDedicatedEditorOpenRef.current = false
    editor.trigger('mouse', '_moveTo', {
      position: { lineNumber: 1, column: 1 },
    })
    editor.trigger('mouse', '_moveTo', { position })
    editor.focus()
  }

  const isSuggestionsOpened = () => {
    const { editor } = monacoObjects.current || {}
    if (!editor) return false
    const suggestController = editor.getContribution<any>(
      'editor.contrib.suggestController',
    )
    return suggestController?.model?.state === 1
  }

  const triggerSuggestions = () => {
    isEscapedSuggestions.current = false
    const { editor } = monacoObjects.current || {}
    setTimeout(() =>
      editor?.trigger('', 'editor.action.triggerSuggest', { auto: false }),
    )
  }

  const hideSyntaxWidget = (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
  ) => {
    editor.removeContentWidget(onTriggerContentWidget(null))
    syntaxWidgetContext?.set(false)
    isWidgetOpen.current = false
  }

  const showSyntaxWidget = (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    position: monacoEditor.Position,
    language: string,
  ) => {
    editor.addContentWidget(onTriggerContentWidget(position, language))
    isWidgetOpen.current = true
    syntaxWidgetContext?.set(true)
  }

  const updateArgFromDedicatedEditor = (value: string = '') => {
    if (!syntaxCommand.current || !monacoObjects.current) return
    const { editor } = monacoObjects?.current

    const model = editor.getModel()
    if (!model) return

    const wrapQuote = syntaxCommand.current.argToReplace[0]
    const replaceCommand = syntaxCommand.current.fullQuery.replace(
      syntaxCommand.current.argToReplace,
      `${wrapQuote}${value}${wrapQuote}`,
    )
    editor.updateOptions({ readOnly: false })
    editor.executeEdits(null, [
      {
        range: new monacoEditor.Range(
          syntaxCommand.current.commandPosition.startLine,
          0,
          syntaxCommand.current.commandPosition.endLine,
          model.getLineLength(syntaxCommand.current.commandPosition.endLine) +
            1,
        ),
        text: replaceCommand,
      },
    ])
    setIsDedicatedEditorOpen(false)
    triggerUpdateCursorPosition(editor)
    sendEventTelemetry({
      event: TelemetryEvent.WORKBENCH_NON_REDIS_EDITOR_SAVED,
      eventData: {
        databaseId: instanceId,
        lang: syntaxCommand.current.lang,
      },
    })
  }

  const setupMonacoRedisLang = (monaco: typeof monacoEditor) => {
    disposeCompletionItemProvider =
      monaco.languages.registerCompletionItemProvider(MonacoLanguage.Redis, {
        // refactor/remove trigger function (TODO: after apply suggestion need trigger again)
        // triggerCharacters: [' '], // Dot and space will trigger suggestions
        provideCompletionItems: (): monacoEditor.languages.CompletionList => ({
          suggestions: suggestionsRef.current,
        }),
      }).dispose

    disposeSignatureHelpProvider =
      monaco.languages.registerSignatureHelpProvider(MonacoLanguage.Redis, {
        provideSignatureHelp: (): any =>
          getRediSearchSignutureProvider(helpWidgetRef?.current),
      }).dispose
  }

  const getSuggestions = (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    command?: Nullable<IMonacoQuery>,
  ): {
    forceHide: boolean
    forceShow: boolean
    data: monacoEditor.languages.CompletionItem[]
  } => {
    const position = editor.getPosition()
    const model = editor.getModel()

    if (!position || !model) return asSuggestionsRef([])
    const word = model.getWordUntilPosition(position)
    const range = getRange(position, word)

    if (position.column === 1) {
      helpWidgetRef.current.isOpen = false
      if (command?.info) return asSuggestionsRef([])
      return asSuggestionsRef(
        getCommandsSuggestions(commands, range),
        false,
        false,
      )
    }

    if (!command?.info) {
      return asSuggestionsRef(
        getCommandsSuggestions(commands, range),
        false,
        false,
      )
    }

    const { allArgs, args, cursor } = command
    const [, [currentOffsetArg]] = args

    if (COMMANDS_TO_GET_INDEX_INFO.some((name) => name === command.name)) {
      setSelectedIndex(allArgs[1] || '')
    } else {
      setSelectedIndex('')
    }

    const cursorContext: CursorContext = {
      ...cursor,
      currentOffsetArg,
      offset: command.commandCursorPosition,
      range,
    }
    const { suggestions, helpWidget } = findSuggestionsByArg(
      commands,
      command,
      cursorContext,
      { fields: attributesRef.current, indexes: indexesRef.current },
      isEscapedSuggestions.current,
    )

    if (helpWidget) {
      const { isOpen, data } = helpWidget
      helpWidgetRef.current = {
        isOpen,
        data: data || helpWidgetRef.current.data,
      }
    }

    return suggestions
  }

  const isLoading = loading || processing

  return (
    <div className={styles.wrapper}>
      <div
        className={cx(styles.container, {
          [styles.disabled]: isDedicatedEditorOpen,
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
            theme={theme === Theme.Dark ? 'dark' : 'light'}
            value={query}
            options={options}
            className={`${MonacoLanguage.Redis}-editor`}
            onChange={onChange}
            editorDidMount={editorDidMount}
          />
        </div>
        <div className={styles.queryFooter}>
          {useLiteActions ? (
            <QueryLiteActions
              isLoading={isLoading}
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
                isDisabled={isDedicatedEditorOpen}
                isLoading={isLoading}
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
      {isDedicatedEditorOpen && (
        <DedicatedEditor
          initialHeight={input?.current?.scrollHeight || 0}
          langId={syntaxCommand.current.lang}
          query={selectedArg.current.replace(aroundQuotesRegExp, '')}
          onSubmit={updateArgFromDedicatedEditor}
          onCancel={onCancelDedicatedEditor}
        />
      )}
    </div>
  )
}

export default React.memo(Query)
