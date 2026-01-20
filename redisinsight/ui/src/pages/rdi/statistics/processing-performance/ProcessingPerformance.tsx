import React from 'react'

import { Section } from 'uiSrc/components/base/display'
import { IProcessingPerformance } from 'uiSrc/slices/interfaces'
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'

import { Text } from 'uiSrc/components/base/text'
import { StyledInfoPanel } from 'uiSrc/pages/rdi/statistics/status/styles'
import VerticalDivider from '../components/vertical-divider'

const InfoPanel = ({
  label,
  value,
  suffix,
}: {
  label: string
  value: number
  suffix: string
}) => (
  <StyledInfoPanel grow>
    <Row gap="m" responsive align="center">
      <FlexItem grow>
        <Text>{label}</Text>
      </FlexItem>
      <FlexItem>
        <Text color="primary">{value}</Text>
      </FlexItem>
      <FlexItem style={{ minWidth: 40 }}>
        <Text size="s" color="ghost">
          {suffix}
        </Text>
      </FlexItem>
    </Row>
  </StyledInfoPanel>
)

interface Props {
  data: IProcessingPerformance
}

const ProcessingPerformance = ({
  data: {
    totalBatches,
    batchSizeAvg,
    processTimeAvg,
    ackTimeAvg,
    recPerSecAvg,
    readTimeAvg,
    totalTimeAvg,
  },
}: Props) => {
  return (
    <Section.Compose collapsible defaultOpen id="processing-performance-info">
      <Section.Header.Compose>
        <Section.Header.Label label="Processing performance information" />
        <Section.Header.CollapseButton />
      </Section.Header.Compose>
      <Section.Body>
        <Row responsive gap="s">
          <FlexItem grow>
            <Col gap="s">
              <InfoPanel
                label="Total batches"
                value={totalBatches}
                suffix="Total"
              />
              <InfoPanel
                label="Batch size average"
                value={batchSizeAvg}
                suffix="MB"
              />
              <InfoPanel
                label="Process time average"
                value={processTimeAvg}
                suffix="ms"
              />
            </Col>
          </FlexItem>
          <VerticalDivider />
          <FlexItem grow>
            <Col gap="s">
              <InfoPanel
                label="ACK time average"
                value={ackTimeAvg}
                suffix="sec"
              />
              <InfoPanel
                label="Records per second average"
                value={recPerSecAvg}
                suffix="/sec"
              />
              <InfoPanel
                label="Read time average"
                value={readTimeAvg}
                suffix="ms"
              />
            </Col>
          </FlexItem>
          <VerticalDivider />
          <FlexItem grow>
            <Row gap="s" align="start">
              <InfoPanel
                label="Total time average"
                value={totalTimeAvg}
                suffix="sec"
              />
            </Row>
          </FlexItem>
        </Row>
      </Section.Body>
    </Section.Compose>
  )
}

export default ProcessingPerformance
