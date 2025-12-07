import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import {
  monitorSelector,
  startMonitor,
  togglePauseMonitor,
} from 'uiSrc/slices/cli/monitor'
import { cliSettingsSelector } from 'uiSrc/slices/cli/cli-settings'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { FeatureFlagComponent } from 'uiSrc/components'
import { FeatureFlags } from 'uiSrc/constants'
import Monitor from './Monitor'
import MonitorHeader from './MonitorHeader'

import styles from './Monitor/styles.module.scss'

const MonitorWrapper = () => {
  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const { items, isStarted, isRunning, isPaused, isSaveToFile, error } =
    useSelector(monitorSelector)
  const { isShowCli, isShowHelper } = useSelector(cliSettingsSelector)

  const dispatch = useDispatch()

  const handleRunMonitor = () => {
    sendEventTelemetry({
      event: isPaused
        ? TelemetryEvent.PROFILER_RESUMED
        : TelemetryEvent.PROFILER_PAUSED,
      eventData: { databaseId: instanceId },
    })
    dispatch(togglePauseMonitor())
  }

  const onRunMonitor = (isSaveToLog: boolean = false) => {
    sendEventTelemetry({
      event: TelemetryEvent.PROFILER_STARTED,
      eventData: {
        databaseId: instanceId,
        logSaving: isSaveToLog,
      },
    })
    dispatch(startMonitor(isSaveToLog))
  }

  return (
    <section className={styles.monitorWrapper} data-testid="monitor-container">
      <FeatureFlagComponent
        name={FeatureFlags.envDependent}
        otherwise={
          <div
            data-testid="monitor-not-supported"
            style={{ display: 'grid', placeContent: 'center', height: '100%' }}
          >
            <div className="cli-output-response-fail">
              Monitor not supported in this environment.
            </div>
          </div>
        }
      >
        <MonitorHeader handleRunMonitor={handleRunMonitor} />
        <Monitor
          items={items}
          error={error}
          isStarted={isStarted}
          isPaused={isPaused}
          isRunning={isRunning}
          isShowCli={isShowCli}
          isSaveToFile={isSaveToFile}
          isShowHelper={isShowHelper}
          handleRunMonitor={onRunMonitor}
        />
      </FeatureFlagComponent>
    </section>
  )
}

export default React.memo(MonitorWrapper)
