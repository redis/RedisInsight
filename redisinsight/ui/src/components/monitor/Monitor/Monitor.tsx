import React, { useState } from 'react'
import cx from 'classnames'
import AutoSizer from 'react-virtualized-auto-sizer'

import { IMonitorDataPayload } from 'uiSrc/slices/interfaces'

import { RiTooltip } from 'uiSrc/components'
import { RiFlexItem, RiRow } from 'uiSrc/components/base/layout'
import { RiIconButton } from 'uiSrc/components/base/forms'
import { PlayFilledIcon, RiIcon } from 'uiSrc/components/base/icons'
import { RiColorText } from 'uiSrc/components/base/text'
import { RiSwitchInput } from 'uiSrc/components/base/inputs'
import MonitorLog from '../MonitorLog'
import MonitorOutputList from '../MonitorOutputList'

import styles from './styles.module.scss'

export interface Props {
  items: IMonitorDataPayload[]
  error: string
  isStarted: boolean
  isRunning: boolean
  isPaused: boolean
  isShowHelper: boolean
  isSaveToFile: boolean
  isShowCli: boolean
  handleRunMonitor: (isSaveToLog?: boolean) => void
}

const Monitor = (props: Props) => {
  const {
    items = [],
    error = '',
    isRunning = false,
    isStarted = false,
    isPaused = false,
    isShowHelper = false,
    isShowCli = false,
    isSaveToFile = false,
    handleRunMonitor = () => {},
  } = props
  const [saveLogValue, setSaveLogValue] = useState(isSaveToFile)

  const MonitorNotStarted = () => (
    <div className={styles.startContainer} data-testid="monitor-not-started">
      <div className={styles.startContent}>
        <RiTooltip content="Start">
          <RiIconButton
            icon={PlayFilledIcon}
            className={styles.startTitleIcon}
            onClick={() => handleRunMonitor(saveLogValue)}
            aria-label="start monitor"
            data-testid="start-monitor"
          />
        </RiTooltip>
        <div className={styles.startTitle}>Start Profiler</div>
        <RiRow style={{ flexGrow: 0 }}>
          <RiFlexItem>
            <RiIcon
              className={cx(styles.iconWarning, 'warning--light')}
              type="ToastDangerIcon"
              size="m"
              color="attention600"
              aria-label="alert icon"
              style={{ paddingTop: 2 }}
            />
          </RiFlexItem>
          <RiFlexItem>
            <RiColorText
              color="warning"
              className="warning--light"
              style={{ paddingLeft: 4 }}
              data-testid="monitor-warning-message"
            >
              Running Profiler will decrease throughput, avoid running it in
              production databases.
            </RiColorText>
          </RiFlexItem>
        </RiRow>
      </div>
      <div className={styles.saveLogContainer} data-testid="save-log-container">
        <RiTooltip
          title="Allows you to download the generated log file after pausing the Profiler"
          content="Profiler log is saved to a file on your local machine with no size limitation.
          The temporary log file will be automatically rewritten when the Profiler is reset."
          data-testid="save-log-tooltip"
        >
          <RiSwitchInput
            title="Save Log"
            checked={saveLogValue}
            onCheckedChange={setSaveLogValue}
            data-testid="save-log-switch"
          />
        </RiTooltip>
      </div>
    </div>
  )

  const MonitorError = () => (
    <div className={styles.startContainer} data-testid="monitor-error">
      <div className={cx(styles.startContent, styles.startContentError)}>
        <RiRow>
          <RiFlexItem>
            <RiIcon
              type="BannedIcon"
              size="m"
              color="danger"
              aria-label="no permissions icon"
            />
          </RiFlexItem>
          <RiFlexItem grow>
            <RiColorText
              color="danger"
              style={{ paddingLeft: 4 }}
              data-testid="monitor-error-message"
            >
              {error}
            </RiColorText>
          </RiFlexItem>
        </RiRow>
      </div>
    </div>
  )

  return (
    <>
      <div
        className={cx(styles.container, {
          [styles.isRunning]: isRunning && !isPaused,
        })}
        data-testid="monitor"
      >
        {error && !isRunning ? (
          <MonitorError />
        ) : (
          <>
            {!isStarted && <MonitorNotStarted />}
            {!items?.length && isRunning && !isPaused && (
              <div
                data-testid="monitor-started"
                style={{ paddingTop: 10, paddingLeft: 12 }}
              >
                Profiler is started.
              </div>
            )}
          </>
        )}
        {isStarted && (
          <div className={styles.content}>
            {!!items?.length && (
              <AutoSizer>
                {({ width, height }) => (
                  <MonitorOutputList
                    width={width || 0}
                    height={height || 0}
                    items={items}
                    compressed={isShowCli || isShowHelper}
                  />
                )}
              </AutoSizer>
            )}
          </div>
        )}
        {isStarted && isPaused && <MonitorLog />}
      </div>
    </>
  )
}

export default React.memo(Monitor)
