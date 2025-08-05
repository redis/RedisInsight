import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import { useParams } from 'react-router-dom'

import {
  monitorSelector,
  resetMonitorItems,
  setMonitorInitialState,
  toggleHideMonitor,
  toggleMonitor,
} from 'uiSrc/slices/cli/monitor'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { OnboardingTour, RiTooltip } from 'uiSrc/components'
import { ONBOARDING_FEATURES } from 'uiSrc/components/onboarding-features'

import { RiFlexItem, RiRow } from 'uiSrc/components/base/layout'
import { Text } from 'uiSrc/components/base/text'
import { RiIconButton } from 'uiSrc/components/base/forms'
import {
  PlayIcon,
  PauseIcon,
  DeleteIcon,
  BannedIcon,
  RiIcon,
} from 'uiSrc/components/base/icons'
import { WindowControlGroup } from 'uiSrc/components/base'
import styles from './styles.module.scss'

export interface Props {
  handleRunMonitor: () => void
}

const MonitorHeader = ({ handleRunMonitor }: Props) => {
  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const {
    isRunning,
    isPaused,
    isResumeLocked,
    isStarted,
    items = [],
    error,
    loadingPause,
  } = useSelector(monitorSelector)
  const isErrorShown = !!error && !isRunning
  const disabledPause = isErrorShown || isResumeLocked || loadingPause
  const dispatch = useDispatch()

  const handleCloseMonitor = () => {
    if (isRunning) {
      sendEventTelemetry({
        event: TelemetryEvent.PROFILER_STOPPED,
        eventData: { databaseId: instanceId },
      })
    }
    sendEventTelemetry({
      event: TelemetryEvent.PROFILER_CLOSED,
      eventData: { databaseId: instanceId },
    })
    dispatch(setMonitorInitialState())
  }

  const handleHideMonitor = () => {
    sendEventTelemetry({
      event: TelemetryEvent.PROFILER_MINIMIZED,
      eventData: { databaseId: instanceId },
    })

    dispatch(toggleMonitor())
    dispatch(toggleHideMonitor())
  }

  const handleClearMonitor = () => {
    sendEventTelemetry({
      event: TelemetryEvent.PROFILER_CLEARED,
      eventData: { databaseId: instanceId },
    })
    dispatch(resetMonitorItems())
  }

  return (
    <div className={styles.container} data-testid="monitor-header">
      <RiRow justify="between" align="center" style={{ height: '100%' }}>
        <RiFlexItem className={styles.title}>
          <RiIcon type="ProfilerIcon" size="m" />
          <OnboardingTour
            options={ONBOARDING_FEATURES.BROWSER_PROFILER}
            anchorPosition="upLeft"
            panelClassName={styles.profilerOnboardPanel}
          >
            <Text>Profiler</Text>
          </OnboardingTour>
        </RiFlexItem>
        {isStarted && (
          <RiFlexItem direction="row" className={styles.actions}>
            <RiTooltip
              content={
                isErrorShown || isResumeLocked
                  ? ''
                  : !isPaused
                    ? 'Pause'
                    : 'Resume'
              }
              anchorClassName="inline-flex"
            >
              <RiIconButton
                icon={
                  isErrorShown || isResumeLocked
                    ? BannedIcon
                    : !isPaused
                      ? PauseIcon
                      : PlayIcon
                }
                onClick={() => handleRunMonitor()}
                aria-label="start/stop monitor"
                data-testid="toggle-run-monitor"
                disabled={disabledPause}
              />
            </RiTooltip>
            <RiTooltip
              content={
                !isStarted || !items.length ? '' : 'Clear Profiler Window'
              }
              anchorClassName={cx('inline-flex', {
                transparent: !isStarted || !items.length,
              })}
            >
              <RiIconButton
                icon={DeleteIcon}
                onClick={handleClearMonitor}
                aria-label="clear profiler"
                data-testid="clear-monitor"
              />
            </RiTooltip>
          </RiFlexItem>
        )}
        <RiFlexItem grow />
        <WindowControlGroup
          onClose={handleCloseMonitor}
          onHide={handleHideMonitor}
          id="monitor"
        />
      </RiRow>
    </div>
  )
}

export default MonitorHeader
