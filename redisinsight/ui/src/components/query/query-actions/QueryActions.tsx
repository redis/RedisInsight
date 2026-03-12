import React, { useCallback, useMemo, useState } from 'react'
import { monaco as monacoEditor } from 'react-monaco-editor'

import { ResultsMode, RunQueryMode } from 'uiSrc/slices/interfaces'
import { KEYBOARD_SHORTCUTS } from 'uiSrc/constants'
import { KeyboardShortcut, RiTooltip } from 'uiSrc/components'
import { isGroupMode, Nullable } from 'uiSrc/utils'

import { RiIcon, CalendarIcon } from 'uiSrc/components/base/icons'
import { RiPopover } from 'uiSrc/components/base/popover/RiPopover'

import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { Text } from 'uiSrc/components/base/text'
import RunButton from 'uiSrc/components/query/components/RunButton'
import { Row } from 'uiSrc/components/base/layout/flex'
import { QADivider } from 'uiSrc/components/query/query-actions/QueryActions.styles'
import { ToggleButton, EmptyButton } from 'uiSrc/components/base/forms/buttons'
import { DateTimePicker } from 'uiSrc/components/datetime-picker'
import { commandHasUnixTimeArgs } from 'uiSrc/components/datetime-picker/utils'
import { useQueryEditorContext } from 'uiSrc/components/query/context/query-editor.context'

export interface Props {
  onChangeMode?: () => void
  onChangeGroupMode?: () => void
  onSubmit: () => void
  activeMode: RunQueryMode
  resultsMode?: ResultsMode
  isLoading?: boolean
}

const insertTimestampAtCursor = (
  editor?: Nullable<monacoEditor.editor.IStandaloneCodeEditor>,
  timestamp?: number,
) => {
  if (!editor || !timestamp) {
    return
  }

  const position = editor.getPosition()
  if (!position) {
    return
  }

  const range = {
    startLineNumber: position.lineNumber,
    startColumn: position.column,
    endLineNumber: position.lineNumber,
    endColumn: position.column,
  }

  editor.executeEdits('datetime-picker', [{ range, text: String(timestamp) }])

  editor.focus()
}

const QueryActions = (props: Props) => {
  const {
    isLoading,
    activeMode,
    resultsMode,
    onChangeMode,
    onChangeGroupMode,
    onSubmit,
  } = props

  const { monacoObjects, query, commands } = useQueryEditorContext()
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  const showTimestampPicker = useMemo(
    () => commandHasUnixTimeArgs(commands, query),
    [commands, query],
  )

  const handleTimestampInsert = useCallback(
    (timestamp: number) => {
      insertTimestampAtCursor(monacoObjects.current?.editor, timestamp)
      setIsDatePickerOpen(false)
    },
    [monacoObjects],
  )

  const KeyBoardTooltipContent = KEYBOARD_SHORTCUTS?.workbench?.runQuery && (
    <>
      <Text size="s">{KEYBOARD_SHORTCUTS.workbench.runQuery?.label}:</Text>
      <Spacer size="s" />
      <KeyboardShortcut
        separator={KEYBOARD_SHORTCUTS?._separator}
        items={KEYBOARD_SHORTCUTS.workbench.runQuery.keys}
      />
    </>
  )

  return (
    <Row align="center" justify="between" gap="l" grow={false}>
      {onChangeMode && (
        <RiTooltip
          position="left"
          content="Enables the raw output mode"
          data-testid="change-mode-tooltip"
        >
          <ToggleButton
            onPressedChange={() => onChangeMode()}
            disabled={isLoading}
            pressed={activeMode === RunQueryMode.Raw}
            data-testid="btn-change-mode"
          >
            <RiIcon size="m" type="RawModeIcon" />
            <Text size="s">Raw mode</Text>
          </ToggleButton>
        </RiTooltip>
      )}
      {onChangeGroupMode && (
        <RiTooltip
          position="left"
          content={
            <>
              Groups the command results into a single window.
              <br />
              When grouped, the results can be visualized only in the text
              format.
            </>
          }
          data-testid="group-results-tooltip"
        >
          <ToggleButton
            onPressedChange={() => onChangeGroupMode()}
            disabled={isLoading}
            pressed={isGroupMode(resultsMode)}
            data-testid="btn-change-group-mode"
          >
            <RiIcon size="m" type="GroupModeIcon" />
            <Text size="s">Group results</Text>
          </ToggleButton>
        </RiTooltip>
      )}
      <QADivider orientation="vertical" color="separatorColor" />
      {showTimestampPicker && (
        <>
          <RiPopover
            isOpen={isDatePickerOpen}
            closePopover={() => setIsDatePickerOpen(false)}
            anchorPosition="upRight"
            trigger={
              <RiTooltip
                position="left"
                content="Pick a date/time and insert as Unix timestamp"
                data-testid="timestamp-picker-tooltip"
              >
                <EmptyButton
                  onClick={() => setIsDatePickerOpen((prev) => !prev)}
                  data-testid="btn-datetime-picker"
                  aria-label="Timestamp picker"
                >
                  <Row align="center" gap="m">
                    <CalendarIcon size="S" />
                    <Text size="s">Timestamp</Text>
                  </Row>
                </EmptyButton>
              </RiTooltip>
            }
          >
            <DateTimePicker onSubmit={handleTimestampInsert} />
          </RiPopover>
          <QADivider orientation="vertical" color="separatorColor" />
        </>
      )}
      <RiTooltip
        position="left"
        content={
          isLoading
            ? 'Please wait while the commands are being executed…'
            : KeyBoardTooltipContent
        }
        data-testid="run-query-tooltip"
      >
        <RunButton isLoading={isLoading} onSubmit={onSubmit} />
      </RiTooltip>
    </Row>
  )
}

export default QueryActions
