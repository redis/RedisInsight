import React from 'react'

import cx from 'classnames'
import { ResultsMode, RunQueryMode } from 'uiSrc/slices/interfaces'
import { KEYBOARD_SHORTCUTS } from 'uiSrc/constants'
import { KeyboardShortcut, RiTooltip } from 'uiSrc/components'
import { isGroupMode } from 'uiSrc/utils'

import { GroupModeIcon, RawModeIcon } from 'uiSrc/components/base/icons'

import Divider from 'uiSrc/components/divider/Divider'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import { Text } from 'uiSrc/components/base/text'
import styles from './styles.module.scss'
import RunButton from 'uiSrc/components/query/components/RunButton'

export interface Props {
  onChangeMode?: () => void
  onChangeGroupMode?: () => void
  onSubmit: () => void
  activeMode: RunQueryMode
  resultsMode?: ResultsMode
  isLoading?: boolean
  isDisabled?: boolean
}

const QueryActions = (props: Props) => {
  const {
    isLoading,
    isDisabled,
    activeMode,
    resultsMode,
    onChangeMode,
    onChangeGroupMode,
    onSubmit,
  } = props
  const KeyBoardTooltipContent = KEYBOARD_SHORTCUTS?.workbench?.runQuery && (
    <>
      <Text className={styles.tooltipText} size="s">
        {KEYBOARD_SHORTCUTS.workbench.runQuery?.label}:
      </Text>
      <Spacer size="s" />
      <KeyboardShortcut
        badgeTextClassName={styles.tooltipText}
        separator={KEYBOARD_SHORTCUTS?._separator}
        items={KEYBOARD_SHORTCUTS.workbench.runQuery.keys}
      />
    </>
  )

  return (
    <div
      className={cx(styles.actions, { [styles.disabledActions]: isDisabled })}
    >
      {onChangeMode && (
        <RiTooltip
          position="left"
          content="Enables the raw output mode"
          data-testid="change-mode-tooltip"
        >
          <EmptyButton
            onClick={() => onChangeMode()}
            icon={RawModeIcon}
            disabled={isLoading}
            className={cx(styles.btn, styles.textBtn, {
              [styles.activeBtn]: activeMode === RunQueryMode.Raw,
            })}
            data-testid="btn-change-mode"
          >
            Raw mode
          </EmptyButton>
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
          <EmptyButton
            onClick={() => onChangeGroupMode()}
            disabled={isLoading}
            icon={GroupModeIcon}
            className={cx(styles.btn, styles.textBtn, {
              [styles.activeBtn]: isGroupMode(resultsMode),
            })}
            data-testid="btn-change-group-mode"
          >
            Group results
          </EmptyButton>
        </RiTooltip>
      )}
      <Divider
        orientation="vertical"
        colorVariable="separatorColor"
        className={styles.divider}
      />
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
    </div>
  )
}

export default QueryActions
