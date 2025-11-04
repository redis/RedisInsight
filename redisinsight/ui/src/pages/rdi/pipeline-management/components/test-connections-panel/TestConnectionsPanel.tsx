import React from 'react'
import { useSelector } from 'react-redux'

import TestConnectionsLog from 'uiSrc/pages/rdi/pipeline-management/components/test-connections-log'
import { rdiTestConnectionsSelector } from 'uiSrc/slices/rdi/testConnections'

import { Text, Title } from 'uiSrc/components/base/text'
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { CancelSlimIcon } from 'uiSrc/components/base/icons'
import { Loader } from 'uiSrc/components/base/display'
import Divider from 'uiSrc/components/divider/Divider'

interface TestConnectionPanelWrapperProps {
  onClose: () => void
  children?: React.ReactNode
}

const TestConnectionPanelWrapper = ({
  children,
  onClose,
}: TestConnectionPanelWrapperProps) => (
  <Col
    style={{ paddingLeft: 20, borderLeft: '1px solid #ccc', width: 440 }}
    grow
    data-testid="test-connection-panel"
    gap="xxl"
  >
    <FlexItem>
      <Row align="center" justify="between">
        <Title size="L" color="primary">
          Test connection
        </Title>
        <IconButton
          icon={CancelSlimIcon}
          aria-label="close test connections panel"
          onClick={onClose}
          data-testid="close-test-connections-btn"
        />
      </Row>
    </FlexItem>
    <FlexItem />
    <FlexItem grow>{children}</FlexItem>
  </Col>
)

export interface Props {
  onClose: () => void
}

const TestConnectionsPanel = (props: Props) => {
  const { onClose } = props
  const { loading, results } = useSelector(rdiTestConnectionsSelector)

  if (loading) {
    return (
      <TestConnectionPanelWrapper onClose={onClose}>
        <Col centered>
          <FlexItem>
            <Text>Loading results...</Text>
          </FlexItem>
          <FlexItem>
            <Loader
              data-testid="test-connections-loader"
              color="secondary"
              size="xl"
            />
          </FlexItem>
        </Col>
      </TestConnectionPanelWrapper>
    )
  }

  if (!results) {
    return (
      <TestConnectionPanelWrapper onClose={onClose}>
        <Col centered>
          <Text>No results found. Please try again.</Text>
        </Col>
      </TestConnectionPanelWrapper>
    )
  }

  return (
    <TestConnectionPanelWrapper onClose={onClose}>
      <Col gap="xxl">
        <FlexItem>
          <Text color="primary">Source connections</Text>
          <TestConnectionsLog data={results.source} />
        </FlexItem>
        <FlexItem>
          <Divider color="secondary" />
        </FlexItem>
        <FlexItem>
          <Text color="primary">Target connections</Text>
          <TestConnectionsLog data={results.target} />
        </FlexItem>
      </Col>
    </TestConnectionPanelWrapper>
  )
}

export default TestConnectionsPanel
