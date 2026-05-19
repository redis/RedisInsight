import React, { useState } from 'react'
import cx from 'classnames'
import AutoSizer from 'react-virtualized-auto-sizer'

import { IMonitorDataPayload } from 'uiSrc/slices/interfaces'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { ColorText } from 'uiSrc/components/base/text'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import MonitorLog from '../MonitorLog'
import MonitorOutputList from '../MonitorOutputList'
import MonitorNotStarted from '../MonitorNotStarted'

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

  const MonitorError = () => (
    <div className={styles.startContainer} data-testid="monitor-error">
      <div className={cx(styles.startContent, styles.startContentError)}>
        <Row>
          <FlexItem>
            <RiIcon
              type="BannedIcon"
              size="m"
              color="danger"
              aria-label="no permissions icon"
            />
          </FlexItem>
          <FlexItem grow>
            <ColorText
              color="danger"
              style={{ paddingLeft: 4 }}
              data-testid="monitor-error-message"
            >
              {error}
            </ColorText>
          </FlexItem>
        </Row>
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
            {!isStarted && (
              <MonitorNotStarted
                saveLogValue={saveLogValue}
                setSaveLogValue={setSaveLogValue}
                onStart={() => handleRunMonitor(saveLogValue)}
              />
            )}
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
