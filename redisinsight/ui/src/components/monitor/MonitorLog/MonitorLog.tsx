import { format, formatDuration, intervalToDuration } from 'date-fns'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AutoSizer from 'react-virtualized-auto-sizer'

import {
  monitorSelector,
  resetProfiler,
  stopMonitor,
} from 'uiSrc/slices/cli/monitor'
import { cutDurationText } from 'uiSrc/utils'
import { downloadFile } from 'uiSrc/utils/dom/downloadFile'
import { fetchMonitorLog } from 'uiSrc/slices/cli/cli-output'

import { RiFlexItem, RiRow } from 'uiSrc/components/base/layout'
import { RiPrimaryButton, RiSecondaryButton } from 'uiSrc/components/base/forms'
import { RefreshIcon, DownloadIcon, RiIcon } from 'uiSrc/components/base/icons'
import { RiText } from 'uiSrc/components/base/text'
import styles from './styles.module.scss'

const PADDINGS_OUTSIDE = 12
const MIDDLE_SCREEN_RESOLUTION = 460 - PADDINGS_OUTSIDE
const SMALL_SCREEN_RESOLUTION = 360 - PADDINGS_OUTSIDE
const DOWNLOAD_IFRAME_NAME = 'logFileDownloadIFrame'

const MonitorLog = () => {
  const { timestamp, logFileId, isSaveToFile } = useSelector(monitorSelector)
  const dispatch = useDispatch()

  const duration = cutDurationText(
    formatDuration(
      intervalToDuration({
        end: timestamp.duration,
        start: 0,
      }),
    ),
  )

  const downloadBtnProps: any = {
    target: DOWNLOAD_IFRAME_NAME,
  }

  const onResetProfiler = () => {
    dispatch(stopMonitor())
    dispatch(resetProfiler())
  }

  const getPaddingByWidth = (width: number): number => {
    if (width < SMALL_SCREEN_RESOLUTION) return 6
    if (width < MIDDLE_SCREEN_RESOLUTION) return 12
    return 18
  }

  const handleDownloadLog = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()

    dispatch(fetchMonitorLog(logFileId || '', downloadFile))
  }

  return (
    <div className={styles.monitorLogWrapper}>
      <iframe
        title="downloadIframeTarget"
        name={DOWNLOAD_IFRAME_NAME}
        style={{ display: 'none' }}
      />
      <AutoSizer disableHeight>
        {({ width = 0 }) => (
          <div
            className={styles.container}
            style={{
              width,
              paddingLeft: getPaddingByWidth(width),
              paddingRight: getPaddingByWidth(width),
            }}
            data-testid="download-log-panel"
          >
            <RiText
              size="xs"
              color="subdued"
              className={styles.time}
              data-testid="profiler-running-time"
            >
              <RiIcon
                size="s"
                color="informative400"
                type="ExecutionTimeIcon"
              />
              {format(timestamp.start, 'hh:mm:ss')}
              &nbsp;&#8211;&nbsp;
              {format(timestamp.paused, 'hh:mm:ss')}
              &nbsp;(
              {duration}
              {width > SMALL_SCREEN_RESOLUTION && ' Running time'})
            </RiText>
            <RiRow className={styles.actions} justify="between" align="center">
              <RiFlexItem>
                {isSaveToFile && (
                  <RiSecondaryButton
                    size="small"
                    icon={DownloadIcon}
                    className={styles.btn}
                    data-testid="download-log-btn"
                    onClick={handleDownloadLog}
                    {...downloadBtnProps}
                  >
                    {width > SMALL_SCREEN_RESOLUTION && ' Download '}
                    Log
                  </RiSecondaryButton>
                )}
              </RiFlexItem>
              <RiFlexItem>
                <RiPrimaryButton
                  size="small"
                  onClick={onResetProfiler}
                  icon={RefreshIcon}
                  className={styles.btn}
                  data-testid="reset-profiler-btn"
                >
                  Reset
                  {width > SMALL_SCREEN_RESOLUTION && ' Profiler'}
                </RiPrimaryButton>
              </RiFlexItem>
            </RiRow>
          </div>
        )}
      </AutoSizer>
    </div>
  )
}

export default MonitorLog
