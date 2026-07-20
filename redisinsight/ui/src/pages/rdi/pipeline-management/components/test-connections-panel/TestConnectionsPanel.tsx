import React from 'react'
import { useAppSelector } from 'uiSrc/slices/hooks'

import TestConnectionsLog from 'uiSrc/pages/rdi/pipeline-management/components/test-connections-log'
import { rdiTestConnectionsSelector } from 'uiSrc/slices/rdi/testConnections'

import { Text, Title } from 'uiSrc/components/base/text'
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { CancelSlimIcon } from 'uiSrc/components/base/icons'
import { Loader } from 'uiSrc/components/base/display'
import Divider from 'uiSrc/components/divider/Divider'
import { useTranslation } from 'uiSrc/i18n'
import { TestConnectionContainer } from 'uiSrc/pages/rdi/pipeline-management/components/test-connections-panel/styles'

interface TestConnectionPanelWrapperProps {
  onClose: () => void
  children?: React.ReactNode
}

const TestConnectionPanelWrapper = ({
  children,
  onClose,
}: TestConnectionPanelWrapperProps) => {
  const { t } = useTranslation()

  return (
    <TestConnectionContainer grow data-testid="test-connection-panel" gap="xxl">
      <FlexItem>
        <Row align="center" justify="between">
          <Title size="L" color="primary">
            {t('rdi.pipeline.testConn.title')}
          </Title>
          <IconButton
            icon={CancelSlimIcon}
            aria-label={t('rdi.pipeline.testConn.closeAria')}
            onClick={onClose}
            data-testid="close-test-connections-btn"
          />
        </Row>
      </FlexItem>
      <FlexItem />
      <FlexItem grow>{children}</FlexItem>
    </TestConnectionContainer>
  )
}

export interface Props {
  onClose: () => void
}

const TestConnectionsPanel = (props: Props) => {
  const { t } = useTranslation()
  const { onClose } = props
  const { loading, results } = useAppSelector(rdiTestConnectionsSelector)

  if (loading) {
    return (
      <TestConnectionPanelWrapper onClose={onClose}>
        <Col centered>
          <FlexItem>
            <Text>{t('rdi.pipeline.testConn.loading')}</Text>
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
          <Text>{t('rdi.pipeline.testConn.noResults')}</Text>
        </Col>
      </TestConnectionPanelWrapper>
    )
  }

  return (
    <TestConnectionPanelWrapper onClose={onClose}>
      <Col gap="xxl">
        <FlexItem>
          <Text color="primary">{t('rdi.pipeline.testConn.source')}</Text>
          <TestConnectionsLog data={results.source} />
        </FlexItem>
        <FlexItem>
          <Divider colorVariable="separatorColor" />
        </FlexItem>
        <FlexItem>
          <Text color="primary">{t('rdi.pipeline.testConn.target')}</Text>
          <TestConnectionsLog data={results.target} />
        </FlexItem>
      </Col>
    </TestConnectionPanelWrapper>
  )
}

export default TestConnectionsPanel
