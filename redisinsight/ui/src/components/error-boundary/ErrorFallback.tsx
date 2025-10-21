import React from 'react'
import { Col, FlexItem } from 'uiSrc/components/base/layout/flex'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { ColorText, Text } from 'uiSrc/components/base/text'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import CodeBlock from '../code-block'

interface ErrorFallbackProps {
  error?: Error
  errorInfo?: React.ErrorInfo
  onReload?: () => void
  onReset?: () => void
}

const ErrorFallback = ({
  error,
  errorInfo,
  onReload,
  onReset,
}: ErrorFallbackProps) => {
  return (
    // TODO: Figma design
    <Col centered>
      <Col centered gap="xl" style={{ maxWidth: '80%' }}>
        <FlexItem>
          <Text size="XL" color="danger">
            Something went wrong
          </Text>
        </FlexItem>

        <FlexItem>
          <ColorText color="subdued" style={{ textAlign: 'center' }}>
            An unexpected error occurred in the application. The error has been
            logged and reported automatically. You can try reloading the page or
            resetting the component.
          </ColorText>
        </FlexItem>

        <FlexItem>
          <Col gap="m">
            {onReload && (
              <PrimaryButton
                onClick={onReload}
                data-testid="error-boundary-reload"
              >
                Reload Page
              </PrimaryButton>
            )}
            {onReset && (
              <SecondaryButton
                onClick={onReset}
                data-testid="error-boundary-reset"
              >
                Try Again
              </SecondaryButton>
            )}
          </Col>
        </FlexItem>

        {process.env.NODE_ENV === 'development' && error && (
          <>
            <Spacer />
            <FlexItem style={{ width: '100%' }}>
              <details style={{ width: '100%' }}>
                <summary style={{ cursor: 'pointer', marginBottom: '1rem' }}>
                  <Text>Error Details (Development Only)</Text>
                </summary>
                <CodeBlock
                  style={{
                    overflow: 'auto',
                    maxHeight: '200px',
                  }}
                >
                  <strong>Error:</strong> {error.message}
                  {error.stack && (
                    <>
                      <br />
                      <br />
                      <strong>Stack Trace:</strong>
                      <br />
                      {error.stack}
                    </>
                  )}
                  {errorInfo?.componentStack && (
                    <>
                      <br />
                      <br />
                      <strong>Component Stack:</strong>
                      <br />
                      {errorInfo.componentStack}
                    </>
                  )}
                </CodeBlock>
              </details>
            </FlexItem>
          </>
        )}
      </Col>
    </Col>
  )
}

export default ErrorFallback
