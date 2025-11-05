import React from 'react'

import { IRdiPipelineStatus } from 'uiSrc/slices/interfaces'
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import VerticalDivider from '../components/vertical-divider'

import { StyledPanel } from 'uiSrc/pages/rdi/statistics/status/styles'
import { Text, Title } from 'uiSrc/components/base/text'

const StatusItem = ({ label, value }: { label: string; value: string }) => (
  <FlexItem grow>
    <Row gap="m" responsive>
      <FlexItem grow>
        <Text>{label}</Text>
      </FlexItem>
      <FlexItem grow>
        <Text color="primary">{value}</Text>
      </FlexItem>
    </Row>
  </FlexItem>
)

interface Props {
  data: IRdiPipelineStatus
}

const Status = ({ data }: Props) => {
  const { rdiVersion, address, runStatus, syncMode } = data

  return (
    <StyledPanel>
      <Col gap="l">
        <Title size="S" color="primary">
          General info
        </Title>
        <Row gap="m" responsive>
          <StatusItem label="RDI DB Version" value={rdiVersion} />
          <VerticalDivider />
          <StatusItem label="Address" value={address} />
          <VerticalDivider />
          <StatusItem label="Run status" value={runStatus} />
          <VerticalDivider />
          <StatusItem label="Sync Mode" value={syncMode} />
        </Row>
      </Col>
    </StyledPanel>
  )
}

export default Status
