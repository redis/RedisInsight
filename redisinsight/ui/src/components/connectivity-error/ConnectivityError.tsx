import React from 'react'
import SuspenseLoader from 'uiSrc/components/main-router/components/SuspenseLoader'

import { Col, FlexItem } from 'uiSrc/components/base/layout/flex'
import { RiPrimaryButton } from 'uiSrc/components/base/forms'
import { Card } from 'uiSrc/components/base/layout'

export type ConnectivityErrorProps = {
  onRetry?: () => void
  isLoading: boolean
  error?: string | null
}

const ConnectivityError = ({
  isLoading,
  error,
  onRetry,
}: ConnectivityErrorProps) => (
  <Col>
    <Card>
      <Col style={{ minHeight: '100vh' }} centered>
        {isLoading && <SuspenseLoader />}
        <Col centered gap="xl">
          <FlexItem data-testid="connectivity-error-message">{error}</FlexItem>
          {onRetry && (
            <FlexItem>
              <RiPrimaryButton onClick={onRetry}>Retry</RiPrimaryButton>
            </FlexItem>
          )}
        </Col>
      </Col>
    </Card>
  </Col>
)

export default ConnectivityError
