import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { monaco as monacoEditor } from 'react-monaco-editor'

import { DSLNaming } from 'uiSrc/constants'
import { createSyntaxWidget, Nullable } from 'uiSrc/utils'
import { IMonacoQuery } from 'uiSrc/utils/monaco/monacoInterfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { findSuggestionsByQueryArgs } from 'uiSrc/pages/workbench/utils/query'

import { UseDslSyntaxProps, UseDslSyntaxReturn } from './useDslSyntax.types'

const SYNTAX_CONTEXT_ID = 'syntaxWidgetContext'
const SYNTAX_WIDGET_ID = 'syntax.content.widget'
const argInQuotesRegExp = /^['"](.|[\r\n])*['"]$/
const aroundQuotesRegExp = /(^["']|["']$)/g

/**
 * Manages the DSL syntax widget for Cypher, JMESPath, SQLite expressions.
 * Opens a dedicated editor when user clicks the widget or presses Shift+Space.
 * Workbench-only feature -- not used in Vector Search editor.
 */
export const useDslSyntax = ({
  monacoObjects,
  triggerUpdateCursorPosition,
}: UseDslSyntaxProps): UseDslSyntaxReturn => {
  const [isDedicatedEditorOpen, setIsDedicatedEditorOpen] = useState(false)
  const isDedicatedEditorOpenRef = useRef<boolean>(false)
  const isWidgetOpen = useRef(false)
  const isWidgetEscaped = useRef(false)
  const selectedArg = useRef('')
  const syntaxCommand = useRef<any>(null)
  const syntaxWidgetContextRef =
    useRef<Nullable<monacoEditor.editor.IContextKey<boolean>>>(null)

  const { instanceId = '' } = useParams<{ instanceId: string }>()

  useEffect(() => {
    isDedicatedEditorOpenRef.current = isDedicatedEditorOpen
  }, [isDedicatedEditorOpen])

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

  const hideSyntaxWidget = (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
  ) => {
    editor.removeContentWidget(onTriggerContentWidget(null))
    syntaxWidgetContextRef.current?.set(false)
    isWidgetOpen.current = false
  }

  const showSyntaxWidget = (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    position: monacoEditor.Position,
    language: string,
  ) => {
    editor.addContentWidget(onTriggerContentWidget(position, language))
    isWidgetOpen.current = true
    syntaxWidgetContextRef.current?.set(true)
  }

  const onPressWidget = () => {
    if (!monacoObjects.current) return
    const { editor } = monacoObjects.current

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
    const { editor } = monacoObjects.current

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

  const updateArgFromDedicatedEditor = (value: string = '') => {
    if (!syntaxCommand.current || !monacoObjects.current) return
    const { editor } = monacoObjects.current

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

  /**
   * Sets up DSL-specific editor commands (Shift+Space, Escape, mouse click on widget).
   * Call this inside editorDidMount's onSetup callback.
   */
  const setupDslCommands = (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: typeof monacoEditor,
  ) => {
    syntaxWidgetContextRef.current = editor.createContextKey(
      SYNTAX_CONTEXT_ID,
      false,
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
  }

  return {
    isDedicatedEditorOpen,
    isDedicatedEditorOpenRef,
    selectedArg,
    syntaxCommand,
    aroundQuotesRegExp,
    setupDslCommands,
    handleDslSyntax,
    onPressWidget,
    onCancelDedicatedEditor,
    updateArgFromDedicatedEditor,
  }
}
