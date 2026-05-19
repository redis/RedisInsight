import React from 'react'

import { RiTooltip } from 'uiSrc/components'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { Text, Title } from 'uiSrc/components/base/text'
import { SwitchInput } from 'uiSrc/components/base/inputs'
import { Spacer } from 'uiSrc/components/base/layout'
import { Banner } from 'uiSrc/components/base/display/banner'
import { RiImage } from 'uiSrc/components/base/display'
import ProfilerImage from 'uiSrc/assets/img/profiler/magnifier.svg'

import { StyledImagePanel } from '../Monitor/Monitor.styles'
import ProfilerStartButton from '../ProfilerStartButton'

export interface Props {
  saveLogValue: boolean
  setSaveLogValue: (v: boolean) => void
  onStart: () => void
}

const MonitorNotStarted = ({
  saveLogValue,
  setSaveLogValue,
  onStart,
}: Props) => (
  <Row
    align="center"
    style={{ margin: 48 }}
    gap="xxl"
    data-testid="monitor-not-started"
  >
    <StyledImagePanel align="center">
      <RiImage
        src={ProfilerImage}
        alt="Profiler"
        style={{ userSelect: 'none', pointerEvents: 'none' }}
      />
      <Spacer size="l" />
      <Text>
        Get a deeper understanding of your database with real-time command, key,
        and client statistics.
      </Text>
    </StyledImagePanel>

    <Col gap="xl">
      <Title size="M">Profiler</Title>
      <Text>
        Analyze every command sent to Redis in real time to debug issues and
        optimize performance.
      </Text>

      <div>
        <ProfilerStartButton onStart={onStart} />
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

export default MonitorNotStarted
