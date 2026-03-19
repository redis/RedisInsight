import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'
import {
  AZURE_OAUTH_STORAGE_KEY,
  AzureAuthStatus,
} from 'apiSrc/modules/azure/constants'

type CallbackState = 'processing' | 'success' | 'error'

// Styled Components
const PageWrapper = styled(Col)`
  height: 100vh;
  width: 100vw;
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral100};
`

const ContentWrapper = styled.div`
  text-align: center;
`

const Title = styled.div`
  font-size: 2rem;
  font-weight: 500;
  color: ${({ theme }) => theme.semantic.color.text.neutral800};
  margin-bottom: ${({ theme }) => theme.core.space.space150};
`

const Subtitle = styled.div`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.semantic.color.text.neutral600};
`

const ErrorTitle = styled(Title)`
  color: ${({ theme }) => theme.semantic.color.text.danger600};
`

/**
 * Minimal page component for the Azure OAuth callback route.
 * This runs in the popup window when redirected from the API.
 * It extracts the result from URL, stores it in localStorage, and closes.
 */
const AzureAuthCallbackPage = () => {
  const [state, setState] = useState<CallbackState>('processing')

  useEffect(() => {
    const url = new URL(window.location.href)
    const encodedResult = url.searchParams.get('result')

    if (!encodedResult) {
      // No result parameter - store error and show error state
      localStorage.setItem(
        AZURE_OAUTH_STORAGE_KEY,
        JSON.stringify({
          timestamp: Date.now(),
          result: {
            status: AzureAuthStatus.Failed,
            error: 'Missing authentication result',
          },
        }),
      )
      setState('error')
      setTimeout(() => window.close(), 2000)
      return
    }

    try {
      // Use decodeURIComponent + escape to handle non-ASCII characters (e.g., international names)
      // This is the inverse of btoa(unescape(encodeURIComponent(...))) used in the callback template
      const result = JSON.parse(
        decodeURIComponent(escape(atob(decodeURIComponent(encodedResult)))),
      )

      // Store in localStorage for the main window to pick up
      localStorage.setItem(
        AZURE_OAUTH_STORAGE_KEY,
        JSON.stringify({
          timestamp: Date.now(),
          result,
        }),
      )

      setState('success')
      // Close this popup window
      setTimeout(() => window.close(), 500)
    } catch {
      // Failed to parse result - store error for main window and show error state
      localStorage.setItem(
        AZURE_OAUTH_STORAGE_KEY,
        JSON.stringify({
          timestamp: Date.now(),
          result: {
            status: AzureAuthStatus.Failed,
            error: 'Failed to process authentication response',
          },
        }),
      )
      setState('error')
      setTimeout(() => window.close(), 2000)
    }
  }, [])

  if (state === 'error') {
    return (
      <PageWrapper contentCentered grow={false}>
        <ContentWrapper>
          <ErrorTitle>✕ Authentication Failed</ErrorTitle>
          <Subtitle>This window will close automatically...</Subtitle>
        </ContentWrapper>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper contentCentered grow={false}>
      <ContentWrapper>
        <Title>✓ Authentication Complete</Title>
        <Subtitle>This window will close automatically...</Subtitle>
      </ContentWrapper>
    </PageWrapper>
  )
}

export default AzureAuthCallbackPage
