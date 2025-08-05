import React from 'react'

import cx from 'classnames'
import { ResultsMode, RunQueryMode } from 'uiSrc/slices/interfaces'
import { KEYBOARD_SHORTCUTS } from 'uiSrc/constants'
import { KeyboardShortcut, RiTooltip } from 'uiSrc/components'
import { isGroupMode } from 'uiSrc/utils'

import {
  GroupModeIcon,
  PlayFilledIcon,
  RawModeIcon,
} from 'uiSrc/components/base/icons'

import Divider from 'uiSrc/components/divider/Divider'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { RiEmptyButton } from 'uiSrc/components/base/forms'
import { Text } from 'uiSrc/components/base/text'
import styles from './styles.module.scss'

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
          <RiEmptyButton
            onClick={() => onChangeMode()}
            icon={RawModeIcon}
            disabled={isLoading}
            className={cx(styles.btn, styles.textBtn, {
              [styles.activeBtn]: activeMode === RunQueryMode.Raw,
            })}
            data-testid="btn-change-mode"
          >
            Raw mode
          </RiEmptyButton>
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
          <RiEmptyButton
            onClick={() => onChangeGroupMode()}
            disabled={isLoading}
            icon={GroupModeIcon}
            className={cx(styles.btn, styles.textBtn, {
              [styles.activeBtn]: isGroupMode(resultsMode),
            })}
            data-testid="btn-change-group-mode"
          >
            Group results
          </RiEmptyButton>
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
        <RiEmptyButton
          onClick={() => {
            onSubmit()
          }}
          loading={isLoading}
          disabled={isLoading}
          icon={PlayFilledIcon}
          className={cx(styles.btn, styles.submitButton)}
          aria-label="submit"
          data-testid="btn-submit"
        >
          Run
        </RiEmptyButton>
      </RiTooltip>
    </div>
  )
}

export default QueryActions
