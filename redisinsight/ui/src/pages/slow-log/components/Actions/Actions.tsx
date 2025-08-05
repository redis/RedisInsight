import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { DurationUnits } from 'uiSrc/constants'
import { slowLogSelector } from 'uiSrc/slices/analytics/slowlog'
import { AutoRefresh } from 'uiSrc/components'
import { RiPopover, RiTooltip } from 'uiSrc/components/base'
import { Nullable } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { RiFlexItem, RiRow } from 'uiSrc/components/base/layout'
import { RiSpacer } from 'uiSrc/components/base/layout/spacer'
import { EraserIcon, SettingsIcon, RiIcon } from 'uiSrc/components/base/icons'
import {
  RiDestructiveButton,
  RiIconButton,
  RiSecondaryButton,
} from 'uiSrc/components/base/forms'
import { Text } from 'uiSrc/components/base/text'

import SlowLogConfig from '../SlowLogConfig'
import styles from './styles.module.scss'

export interface Props {
  width: number
  isEmptySlowLog: boolean
  durationUnit: Nullable<DurationUnits>
  onClear: () => void
  onRefresh: (maxLen?: number) => void
}

const HIDE_REFRESH_LABEL_WIDTH = 850

const Actions = (props: Props) => {
  const {
    isEmptySlowLog,
    durationUnit,
    width,
    onClear = () => {},
    onRefresh,
  } = props
  const { instanceId } = useParams<{ instanceId: string }>()
  const { name = '' } = useSelector(connectedInstanceSelector)
  const { loading, lastRefreshTime } = useSelector(slowLogSelector)

  const [isPopoverClearOpen, setIsPopoverClearOpen] = useState(false)
  const [isPopoverConfigOpen, setIsPopoverConfigOpen] = useState(false)

  const showClearPopover = () => {
    setIsPopoverClearOpen((isPopoverClearOpen) => !isPopoverClearOpen)
  }

  const closePopoverClear = () => {
    setIsPopoverClearOpen(false)
  }
  const showConfigPopover = () => {
    setIsPopoverConfigOpen((isPopoverConfigOpen) => !isPopoverConfigOpen)
  }

  const closePopoverConfig = () => {
    setIsPopoverConfigOpen(false)
  }

  const handleClearClick = () => {
    onClear()
    closePopoverClear()
  }

  const handleEnableAutoRefresh = (
    enableAutoRefresh: boolean,
    refreshRate: string,
  ) => {
    sendEventTelemetry({
      event: enableAutoRefresh
        ? TelemetryEvent.SLOWLOG_AUTO_REFRESH_ENABLED
        : TelemetryEvent.SLOWLOG_AUTO_REFRESH_DISABLED,
      eventData: {
        databaseId: instanceId,
        refreshRate: enableAutoRefresh ? +refreshRate : undefined,
      },
    })
  }

  const handleChangeAutoRefreshRate = (
    enableAutoRefresh: boolean,
    refreshRate: string,
  ) => {
    if (enableAutoRefresh) {
      sendEventTelemetry({
        event: TelemetryEvent.SLOWLOG_AUTO_REFRESH_ENABLED,
        eventData: {
          databaseId: instanceId,
          refreshRate: +refreshRate,
        },
      })
    }
  }

  const ToolTipContent = (
    <div className={styles.popoverContainer}>
      <RiIcon
        type="ToastDangerIcon"
        color="attention600"
        className={styles.warningIcon}
      />
      <div>
        <Text size="m" component="div">
          <h4 className={styles.popoverTitle}>
            <b>Clear Slow Log?</b>
          </h4>
          <Text size="xs" color="subdued">
            Slow Log will be cleared for&nbsp;
            <span className={styles.popoverDBName}>{name}</span>
            <br />
            NOTE: This is server configuration
          </Text>
        </Text>
        <div className={styles.popoverFooter}>
          <RiDestructiveButton
            size="small"
            icon={EraserIcon}
            onClick={() => handleClearClick()}
            className={styles.popoverDeleteBtn}
            data-testid="reset-confirm-btn"
          >
            Clear
          </RiDestructiveButton>
        </div>
      </div>
    </div>
  )

  return (
    <RiRow className={styles.actions} gap="s" align="center">
      <RiFlexItem grow={5} style={{ alignItems: 'flex-end' }}>
        <AutoRefresh
          postfix="slowlog"
          loading={loading}
          displayText={width > HIDE_REFRESH_LABEL_WIDTH}
          lastRefreshTime={lastRefreshTime}
          containerClassName={styles.refreshContainer}
          onRefresh={() => onRefresh()}
          onEnableAutoRefresh={handleEnableAutoRefresh}
          onChangeAutoRefreshRate={handleChangeAutoRefreshRate}
          testid="slowlog"
        />
      </RiFlexItem>
      <RiFlexItem grow>
        <RiPopover
          ownFocus
          anchorPosition="downRight"
          isOpen={isPopoverConfigOpen}
          panelPaddingSize="m"
          closePopover={() => {}}
          panelClassName={cx('popover-without-top-tail', styles.configWrapper)}
          button={
            <RiSecondaryButton
              size="small"
              icon={SettingsIcon}
              aria-label="Configure"
              onClick={() => showConfigPopover()}
              data-testid="configure-btn"
            >
              Configure
            </RiSecondaryButton>
          }
        >
          <SlowLogConfig
            closePopover={closePopoverConfig}
            onRefresh={onRefresh}
          />
        </RiPopover>
      </RiFlexItem>
      {!isEmptySlowLog && (
        <RiFlexItem grow>
          <RiPopover
            anchorPosition="leftCenter"
            ownFocus
            isOpen={isPopoverClearOpen}
            closePopover={closePopoverClear}
            panelPaddingSize="m"
            button={
              <RiTooltip
                position="left"
                content="Clear Slow Log"
                anchorClassName={styles.icon}
              >
                <RiIconButton
                  icon={EraserIcon}
                  aria-label="Clear Slow Log"
                  onClick={() => showClearPopover()}
                  data-testid="clear-btn"
                />
              </RiTooltip>
            }
          >
            {ToolTipContent}
          </RiPopover>
        </RiFlexItem>
      )}
      <RiFlexItem grow>
        <RiTooltip
          title="Slow Log"
          position="bottom"
          anchorClassName={styles.icon}
          content={
            <span data-testid="slowlog-tooltip-text">
              Slow Log is a list of slow operations for your Redis instance.
              These can be used to troubleshoot performance issues.
              <RiSpacer size="xs" />
              Each entry in the list displays the command, duration and
              timestamp. Any transaction that exceeds{' '}
              <b>slowlog-log-slower-than</b> {durationUnit} are recorded up to a
              maximum of <b>slowlog-max-len</b> after which older entries are
              discarded.
            </span>
          }
        >
          <RiIcon
            className={styles.infoIcon}
            type="InfoIcon"
            style={{ cursor: 'pointer' }}
            data-testid="slow-log-tooltip-icon"
          />
        </RiTooltip>
      </RiFlexItem>
    </RiRow>
  )
}

export default Actions
