import React from 'react'

import { KEYBOARD_SHORTCUTS } from 'uiSrc/constants'
import { KeyboardShortcut, RiTooltip } from 'uiSrc/components'

import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import { Text } from 'uiSrc/components/base/text'
import RunButton from 'uiSrc/components/query/components/RunButton'

export interface Props {
  onSubmit: () => void
  onClear: () => void
  isLoading?: boolean
}

const QueryLiteActions = (props: Props) => {
  const { isLoading, onSubmit, onClear } = props
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
    <>
      <RiTooltip
        position="right"
        content={
          isLoading
            ? 'Please wait while the commands are being executed…'
            : 'Clear query'
        }
        data-testid="clear-query-tooltip"
      >
        <EmptyButton
          onClick={onClear}
          loading={isLoading}
          disabled={isLoading}
          aria-label="clear"
          data-testid="btn-clear"
        >
          Clear
        </EmptyButton>
      </RiTooltip>

      <RiTooltip
        position="left"
        content={
          isLoading
            ? 'Please wait while the commands are being executed…'
            : KeyBoardTooltipContent
        }
        data-testid="run-query-tooltip"
      >
        <RunButton onSubmit={onSubmit} isLoading={isLoading} />
      </RiTooltip>
    </>
  )
}

export default QueryLiteActions
