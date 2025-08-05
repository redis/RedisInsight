import React from 'react'
import { useSelector } from 'react-redux'

import TestConnectionsLog from 'uiSrc/pages/rdi/pipeline-management/components/test-connections-log'
import { rdiTestConnectionsSelector } from 'uiSrc/slices/rdi/testConnections'

import { RiText } from 'uiSrc/components/base/text'
import { RiCol, RiFlexItem } from 'uiSrc/components/base/layout'
import { RiIconButton } from 'uiSrc/components/base/forms'
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
      <RiText className={styles.title}>Connection test results</RiText>
      <RiIconButton
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
        <RiCol className={styles.content} centered>
          <RiFlexItem>
            <RiText className={styles.loaderText}>Loading results...</RiText>
          </RiFlexItem>
          <RiFlexItem>
            <RiLoader
              data-testid="test-connections-loader"
              className={styles.loaderIcon}
              color="secondary"
              size="xl"
            />
          </RiFlexItem>
        </RiCol>
      </TestConnectionPanelWrapper>
    )
  }

  if (!results) {
    return (
      <TestConnectionPanelWrapper onClose={onClose}>
        <RiText className={styles.subtitle}>
          No results found. Please try again.
        </RiText>
      </TestConnectionPanelWrapper>
    )
  }

  return (
    <TestConnectionPanelWrapper onClose={onClose}>
      <div className={styles.content}>
        <RiText
          className={styles.subtitle}
          style={{ marginTop: 16, marginBottom: 10 }}
        >
          Source connections
        </RiText>

        <TestConnectionsLog data={results.source} />

        <RiText
          className={styles.subtitle}
          style={{ marginTop: 16, marginBottom: 10 }}
        >
          Target connections
        </RiText>

        <TestConnectionsLog data={results.target} />
      </div>
    </TestConnectionPanelWrapper>
  )
}

export default TestConnectionsPanel
