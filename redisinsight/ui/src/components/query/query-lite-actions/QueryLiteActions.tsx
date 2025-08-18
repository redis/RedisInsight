import React from 'react'

import { KEYBOARD_SHORTCUTS } from 'uiSrc/constants'
import { KeyboardShortcut } from 'uiSrc/components'

import { PlayFilledIcon } from 'uiBase/icons'
import { RiText } from 'uiBase/text'
import { RiSpacer } from 'uiBase/layout'
import { RiTooltip } from 'uiBase/display'
import { RiEmptyButton, Button } from 'uiBase/forms'

export interface Props {
  onSubmit: () => void
  onClear: () => void
  isLoading?: boolean
}

const QueryLiteActions = (props: Props) => {
  const { isLoading, onSubmit, onClear } = props
  const KeyBoardTooltipContent = KEYBOARD_SHORTCUTS?.workbench?.runQuery && (
    <>
      <RiText size="s">{KEYBOARD_SHORTCUTS.workbench.runQuery?.label}:</RiText>
      <RiSpacer size="s" />
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
        <RiEmptyButton
          onClick={onClear}
          loading={isLoading}
          disabled={isLoading}
          aria-label="clear"
          data-testid="btn-clear"
        >
          Clear
        </RiEmptyButton>
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
        <Button
          onClick={onSubmit}
          loading={isLoading}
          disabled={isLoading}
          icon={PlayFilledIcon}
          aria-label="submit"
          data-testid="btn-submit"
        >
          Run
        </Button>
      </RiTooltip>
    </>
  )
}

export default QueryLiteActions
