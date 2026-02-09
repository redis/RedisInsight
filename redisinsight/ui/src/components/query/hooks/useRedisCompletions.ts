import { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { monaco as monacoEditor } from 'react-monaco-editor'

import { MonacoLanguage } from 'uiSrc/constants'
import { Nullable } from 'uiSrc/utils'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { appRedisCommandsSelector } from 'uiSrc/slices/app/redis-commands'
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
import { actionTriggerParameterHints, findCompleteQuery } from 'uiSrc/utils'

import {
  UseRedisCompletionsProps,
  UseRedisCompletionsReturn,
} from './useRedisCompletions.types'

/**
 * Manages the entire autocomplete, suggestion, and signature help system
 * for the Redis/RQE query editor.
 */
export const useRedisCompletions = ({
  monacoObjects,
  commands,
  indexes,
}: UseRedisCompletionsProps): UseRedisCompletionsReturn => {
  const [selectedIndex, setSelectedIndex] = useState('')

  const suggestionsRef = useRef<monacoEditor.languages.CompletionItem[]>([])
  const helpWidgetRef = useRef<any>({ isOpen: false, data: {} })
  const indexesRef = useRef<RedisResponseBuffer[]>([])
  const attributesRef = useRef<any>([])
  const isEscapedSuggestions = useRef<boolean>(false)

  const disposeCompletionRef = useRef<() => void>(() => {})
  const disposeSignatureRef = useRef<() => void>(() => {})

  const { commandsArray: REDIS_COMMANDS_ARRAY, spec: REDIS_COMMANDS_SPEC } =
    useSelector(appRedisCommandsSelector)

  const dispatch = useDispatch()

  const compositeTokens = useMemo(
    () =>
      commands
        .filter((command) => command.token && command.token.includes(' '))
        .map(({ token }) => token)
        .concat(...COMPOSITE_ARGS),
    [commands],
  )

  // Sync indexes ref
  useEffect(() => {
    indexesRef.current = indexes
  }, [indexes])

  // Debounced fetch of index info when selected index changes
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

  const setupProviders = (monaco: typeof monacoEditor) => {
    disposeCompletionRef.current =
      monaco.languages.registerCompletionItemProvider(MonacoLanguage.Redis, {
        provideCompletionItems: (): monacoEditor.languages.CompletionList => ({
          suggestions: suggestionsRef.current,
        }),
      }).dispose

    disposeSignatureRef.current =
      monaco.languages.registerSignatureHelpProvider(MonacoLanguage.Redis, {
        provideSignatureHelp: (): any =>
          getRediSearchSignutureProvider(helpWidgetRef?.current),
      }).dispose
  }

  const disposeProviders = () => {
    disposeCompletionRef.current()
    disposeSignatureRef.current()
  }

  const onTriggerParameterHints = () => {
    if (!monacoObjects.current) return

    const { editor } = monacoObjects.current
    const model = editor.getModel()
    const { lineNumber = 0 } = editor.getPosition() ?? {}
    const lineContent = model?.getLineContent(lineNumber)?.trim() ?? ''
    const matchedCommand =
      REDIS_COMMANDS_ARRAY.find((command) =>
        lineContent?.trim().startsWith(command),
      ) ?? ''
    const isTriggerHints =
      lineContent.split(' ').length < 2 + matchedCommand.split(' ').length

    if (isTriggerHints) {
      actionTriggerParameterHints(editor)
    }
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

  const handleSuggestions = (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    command?: Nullable<IMonacoQuery>,
  ) => {
    const { data, forceHide, forceShow } = getSuggestions(editor, command)
    suggestionsRef.current = data

    // Prevent suggestions if editor is not focused or cursor is not set
    if (!editor.hasTextFocus() || !editor.getPosition()) {
      editor.trigger('', 'hideSuggestWidget', null)
      return
    }

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

  /**
   * Handles cursor change events for suggestion logic.
   * Returns the parsed command if found (for DSL syntax and other consumers).
   */
  const handleCursorChange = (
    e: monacoEditor.editor.ICursorPositionChangedEvent,
    isDedicatedEditorOpen = false,
  ): Nullable<IMonacoQuery> => {
    if (!monacoObjects.current) return null
    const { editor } = monacoObjects.current
    const model = editor.getModel()

    if (!model || isDedicatedEditorOpen) {
      return null
    }

    const command = findCompleteQuery(
      model,
      e.position,
      REDIS_COMMANDS_SPEC,
      REDIS_COMMANDS_ARRAY,
      compositeTokens as string[],
    )

    handleSuggestions(editor, command)
    return command
  }

  const setupSuggestionWidgetListener = (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
  ) => {
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
  }

  const setSuggestionsData = (data: monacoEditor.languages.CompletionItem[]) => {
    suggestionsRef.current = data
  }

  const setEscapedSuggestions = (value: boolean) => {
    isEscapedSuggestions.current = value
  }

  return {
    selectedIndex,
    helpWidgetRef: helpWidgetRef as React.MutableRefObject<{ isOpen: boolean; data: any }>,
    compositeTokens,
    getSuggestions,
    handleSuggestions,
    onTriggerParameterHints,
    triggerSuggestions,
    isSuggestionsOpened,
    setupProviders,
    disposeProviders,
    handleCursorChange,
    setSuggestionsData,
    setEscapedSuggestions,
  }
}
