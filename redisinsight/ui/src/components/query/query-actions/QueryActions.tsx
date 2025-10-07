import React from 'react'

import { ResultsMode, RunQueryMode } from 'uiSrc/slices/interfaces'
import { KEYBOARD_SHORTCUTS } from 'uiSrc/constants'
import { KeyboardShortcut, RiTooltip } from 'uiSrc/components'
import { isGroupMode } from 'uiSrc/utils'

import { GroupModeIcon, RawModeIcon } from 'uiSrc/components/base/icons'

import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { Text } from 'uiSrc/components/base/text'
import RunButton from 'uiSrc/components/query/components/RunButton'
import { Row } from 'uiSrc/components/base/layout/flex'
import {
  QABtn,
  QADivider,
} from 'uiSrc/components/query/query-actions/QueryActions.styles'

export interface Props {
  onChangeMode?: () => void
  onChangeGroupMode?: () => void
  onSubmit: () => void
  activeMode: RunQueryMode
  resultsMode?: ResultsMode
  isLoading?: boolean
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
          <QABtn
            onClick={() => onChangeMode()}
            icon={RawModeIcon}
            disabled={isLoading}
            $active={activeMode === RunQueryMode.Raw}
            data-testid="btn-change-mode"
          >
            Raw mode
          </QABtn>
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
          <QABtn
            onClick={() => onChangeGroupMode()}
            disabled={isLoading}
            icon={GroupModeIcon}
            $active={isGroupMode(resultsMode)}
            data-testid="btn-change-group-mode"
          >
            Group results
          </QABtn>
        </RiTooltip>
      )}
      <QADivider orientation="vertical" colorVariable="separatorColor" />
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
