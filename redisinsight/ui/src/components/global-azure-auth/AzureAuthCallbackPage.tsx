import React, { useEffect, useState } from 'react'
import { Title, Text } from 'uiSrc/components/base/text'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { AZURE_OAUTH_STORAGE_KEY, AzureAuthStatus } from 'uiSrc/constants'
import * as S from './AzureAuthCallbackPage.styles'

/**
 * Minimal page component for the Azure OAuth callback route.
 * This runs in the popup window when redirected from the API.
 * It extracts the result from URL, stores it in localStorage, and closes.
 */
const AzureAuthCallbackPage = () => {
  const [state, setState] = useState<AzureAuthStatus>(
    AzureAuthStatus.Processing,
  )

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
      setState(AzureAuthStatus.Failed)
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

      setState(AzureAuthStatus.Succeed)
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
      setState(AzureAuthStatus.Failed)
      setTimeout(() => window.close(), 2000)
    }
  }, [])

  if (state === AzureAuthStatus.Processing) {
    return (
      <S.PageWrapper contentCentered grow={false}>
        <S.ContentWrapper>
          <Title size="L">Processing...</Title>
          <Spacer size="s" />
          <Text size="M" color="subdued">
            Please wait
          </Text>
        </S.ContentWrapper>
      </S.PageWrapper>
    )
  }

  if (state === AzureAuthStatus.Failed) {
    return (
      <S.PageWrapper contentCentered grow={false}>
        <S.ContentWrapper>
          <Title size="L" color="danger">
            ✕ Something went wrong
          </Title>
          <Spacer size="s" />
          <Text size="M" color="subdued">
            This window will close automatically...
          </Text>
        </S.ContentWrapper>
      </S.PageWrapper>
    )
  }

  // Successfully received and relayed the OAuth result to the main application
  // (regardless of whether the OAuth flow itself succeeded or failed)
  return (
    <S.PageWrapper contentCentered grow={false}>
      <S.ContentWrapper>
        <Title size="L">Returning to RedisInsight...</Title>
        <Spacer size="s" />
        <Text size="M" color="subdued">
          This window will close automatically
        </Text>
      </S.ContentWrapper>
    </S.PageWrapper>
  )
}

export default AzureAuthCallbackPage
