import React from 'react'
import { useSelector } from 'react-redux'

import TestConnectionsLog from 'uiSrc/pages/rdi/pipeline-management/components/test-connections-log'
import { rdiTestConnectionsSelector } from 'uiSrc/slices/rdi/testConnections'

import { Text } from 'uiSrc/components/base/text'
import { Col, FlexItem } from 'uiSrc/components/base/layout/flex'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { CancelSlimIcon } from 'uiSrc/components/base/icons'
import { RiLoader } from 'uiSrc/components/base/display'
import styles from './styles.module.scss'

interface TestConnectionPanelWrapperProps {
  onClose: () => void
  children?: React.ReactNode
}

const TestConnectionPanelWrapper = ({
  children,
  onClose,
}: TestConnectionPanelWrapperProps) => (
  <div className={styles.panel} data-testid="test-connection-panel">
    <div className={styles.header}>
      <Text className={styles.title}>Connection test results</Text>
      <IconButton
        icon={CancelSlimIcon}
        aria-label="close test connections panel"
        className={styles.closeBtn}
        onClick={onClose}
        data-testid="close-test-connections-btn"
      />
    </div>
    {children}
  </div>
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
        <Col className={styles.content} centered>
          <FlexItem>
            <Text className={styles.loaderText}>Loading results...</Text>
          </FlexItem>
          <FlexItem>
            <RiLoader
              data-testid="test-connections-loader"
              className={styles.loaderIcon}
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
        <Text className={styles.subtitle}>
          No results found. Please try again.
        </Text>
      </TestConnectionPanelWrapper>
    )
  }

  return (
    <TestConnectionPanelWrapper onClose={onClose}>
      <div className={styles.content}>
        <Text
          className={styles.subtitle}
          style={{ marginTop: 16, marginBottom: 10 }}
        >
          Source connections
        </Text>

        <TestConnectionsLog data={results.source} />

        <Text
          className={styles.subtitle}
          style={{ marginTop: 16, marginBottom: 10 }}
        >
          Target connections
        </Text>

        <TestConnectionsLog data={results.target} />
      </div>
    </TestConnectionPanelWrapper>
  )
}

export default TestConnectionsPanel
