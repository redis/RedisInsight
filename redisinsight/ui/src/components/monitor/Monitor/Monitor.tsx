import React, { useState } from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'

import { IMonitorDataPayload } from 'uiSrc/slices/interfaces'

import { RiTooltip } from 'uiSrc/components'
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { ColorText, Text, Title } from 'uiSrc/components/base/text'
import { SwitchInput } from 'uiSrc/components/base/inputs'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import MonitorLog from '../MonitorLog'
import MonitorOutputList from '../MonitorOutputList'

import ProfilerImage from 'uiSrc/assets/img/profiler/magnifier.svg'

import * as S from './Monitor.styles'
import { Spacer } from 'uiSrc/components/base/layout'
import { Banner } from 'uiSrc/components/base/display/banner'
import { RiImage } from 'uiSrc/components/base/display'

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
    <Row
      align="center"
      style={{ margin: 48 }}
      gap="xxl"
      data-testid="monitor-not-started"
    >
      <S.StyledImagePanel align="center">
        <RiImage
          src={ProfilerImage}
          alt="Profiler"
          style={{ userSelect: 'none', pointerEvents: 'none' }}
        />
        <Spacer size="l" />
        <Text>
          Get a deeper understanding of your database with real-time command,
          key, and client statistics.
        </Text>
      </S.StyledImagePanel>

      <Col gap="xl">
        <Title size="M">Profiler</Title>
        <Text>
          Analyze every command sent to Redis in real time to debug issues and
          optimize performance.
        </Text>

        <div>
          <RiTooltip content="Enable real-time profiling of your Redis database.">
            <PrimaryButton
              onClick={() => handleRunMonitor(saveLogValue)}
              aria-label="start monitor"
              data-testid="start-monitor"
            >
              Start Profiler
            </PrimaryButton>
          </RiTooltip>
        </div>

        <div data-testid="save-log-container">
          <RiTooltip
            title="Allows you to download the generated log file after pausing the Profiler."
            content="Profiler log is saved to a file on your local machine with no size limitation. The temporary log file will be automatically rewritten when the Profiler is reset."
            data-testid="save-log-tooltip"
          >
            <SwitchInput
              title="Save Log"
              checked={saveLogValue}
              onCheckedChange={setSaveLogValue}
              data-testid="save-log-switch"
            />
          </RiTooltip>
        </div>

        <Banner
          variant="attention"
          showIcon
          data-testid="monitor-warning-message"
          message="Running Profiler will decrease throughput, avoid running it in production databases."
        />
      </Col>
    </Row>
  )

  const MonitorError = () => (
    <S.StartContainer data-testid="monitor-error">
      <S.StartContentError>
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
      </S.StartContentError>
    </S.StartContainer>
  )

  return (
    <>
      <S.Container $isRunning={isRunning && !isPaused} data-testid="monitor">
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
          <S.Content>
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
          </S.Content>
        )}
        {isStarted && isPaused && <MonitorLog />}
      </S.Container>
    </>
  )
}

export default React.memo(Monitor)
