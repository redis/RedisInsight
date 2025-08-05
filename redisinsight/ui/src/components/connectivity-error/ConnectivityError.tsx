import React from 'react'
import SuspenseLoader from 'uiSrc/components/main-router/components/SuspenseLoader'

import { RiCol, RiFlexItem, RiCard } from 'uiSrc/components/base/layout'
import { RiPrimaryButton } from 'uiSrc/components/base/forms'

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
  <RiCol>
    <RiCard>
      <RiCol style={{ minHeight: '100vh' }} centered>
        {isLoading && <SuspenseLoader />}
        <RiCol centered gap="xl">
          <RiFlexItem data-testid="connectivity-error-message">
            {error}
          </RiFlexItem>
          {onRetry && (
            <RiFlexItem>
              <RiPrimaryButton onClick={onRetry}>Retry</RiPrimaryButton>
            </RiFlexItem>
          )}
        </RiCol>
      </RiCol>
    </RiCard>
  </RiCol>
)

export default ConnectivityError
