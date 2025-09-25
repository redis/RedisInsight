import React from 'react'
import SuspenseLoader from 'uiSrc/components/main-router/components/SuspenseLoader'

import { Col, FlexItem } from 'uiSrc/components/base/layout/flex'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'

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
  <Col centered>
    {isLoading && <SuspenseLoader />}
    <Col centered gap="xl">
      <FlexItem data-testid="connectivity-error-message">{error}</FlexItem>
      {onRetry && (
        <FlexItem>
          <PrimaryButton onClick={onRetry}>Retry</PrimaryButton>
        </FlexItem>
      )}
    </Col>
  </Col>
)

export default ConnectivityError
