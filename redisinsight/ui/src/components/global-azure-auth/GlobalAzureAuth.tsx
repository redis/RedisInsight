import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { getConfig } from 'uiSrc/config'

import {
  azureAuthSourceSelector,
  handleAzureOAuthSuccess,
  handleAzureOAuthFailure,
  setAzureLoginSource,
} from 'uiSrc/slices/oauth/azure'
import { AzureLoginSource } from 'uiSrc/slices/interfaces'
import {
  addErrorNotification,
  addMessageNotification,
} from 'uiSrc/slices/app/notifications'
import { AppDispatch } from 'uiSrc/slices/store'
import { Pages } from 'uiSrc/constants'

const AZURE_OAUTH_STORAGE_KEY = 'ri_azure_oauth_result'
const STORAGE_POLL_INTERVAL = 500 // ms
const STORAGE_RESULT_MAX_AGE = 30000 // 30 seconds

interface AzureOAuthCallbackPayload {
  status: string
  account?: {
    id: string
    username: string
    name?: string
  }
  error?: string
}

const riConfig = getConfig()
const isElectron = riConfig.app.type === 'ELECTRON'

/**
 * Global Azure Auth handler for web flow.
 * Polls localStorage for OAuth results from the popup window.
 * This component should be mounted in the main App for non-Electron builds.
 */
const GlobalAzureAuth = () => {
  const dispatch = useDispatch<AppDispatch>()
  const history = useHistory()
  const source = useSelector(azureAuthSourceSelector)
  const sourceRef = useRef(source)
  sourceRef.current = source

  // Process the OAuth callback payload
  const processCallbackPayload = (payload: AzureOAuthCallbackPayload) => {
    const { status, account, error } = payload

    if (status === 'succeed' && account) {
      const azureAccount = {
        id: account.id,
        username: account.username,
        name: account.name,
      }
      const currentSource = sourceRef.current
      dispatch(handleAzureOAuthSuccess(azureAccount))
      dispatch(setAzureLoginSource(null))

      // Only redirect to autodiscovery flow if login was initiated from there
      if (currentSource === AzureLoginSource.Autodiscovery) {
        history.push(Pages.azureSubscriptions)
      }

      // Show success notification only for token refresh
      if (currentSource === AzureLoginSource.TokenRefresh) {
        dispatch(
          addMessageNotification({
            title: 'Signed in to Azure',
            message: 'You can now connect to your Azure database.',
          }),
        )
      }
      return
    }

    // Handle failure
    const errorMessage = error || 'Azure authentication failed'
    dispatch(handleAzureOAuthFailure(errorMessage))
    dispatch(
      addErrorNotification({
        response: {
          data: {
            message: errorMessage,
          },
        },
        persistent: true,
      } as any),
    )
  }

  useEffect(() => {
    // Skip in Electron - uses IPC callbacks via ConfigAzureAuth
    if (isElectron) {
      return undefined
    }

    // Check if we're in the popup window that was redirected from the API
    // URL will be like: /azure-auth-callback?result=<base64-encoded-result>
    const checkUrlForResult = () => {
      const url = new URL(window.location.href)
      if (
        url.pathname === '/azure-auth-callback' &&
        url.searchParams.has('result')
      ) {
        try {
          const encodedResult = url.searchParams.get('result')!
          const result = JSON.parse(atob(decodeURIComponent(encodedResult)))

          // Store in localStorage for the main window to pick up
          localStorage.setItem(
            AZURE_OAUTH_STORAGE_KEY,
            JSON.stringify({
              timestamp: Date.now(),
              result,
            }),
          )

          // Close this popup window after a short delay
          setTimeout(() => {
            window.close()
          }, 500)

          return true
        } catch {
          // Failed to parse result from URL
        }
      }
      return false
    }

    // If we're in the popup, handle the result and close
    if (checkUrlForResult()) {
      return undefined
    }

    // Main window logic below:

    // Poll localStorage for OAuth results from popup
    const checkLocalStorage = () => {
      try {
        const stored = localStorage.getItem(AZURE_OAUTH_STORAGE_KEY)
        if (!stored) return

        const data = JSON.parse(stored)
        const age = Date.now() - data.timestamp

        // Only process recent results
        if (age < STORAGE_RESULT_MAX_AGE && data.result) {
          // Clear immediately to prevent duplicate processing
          localStorage.removeItem(AZURE_OAUTH_STORAGE_KEY)
          processCallbackPayload(data.result)
        } else if (age >= STORAGE_RESULT_MAX_AGE) {
          // Clean up stale results
          localStorage.removeItem(AZURE_OAUTH_STORAGE_KEY)
        }
      } catch {
        // Ignore parse errors
      }
    }

    const pollInterval = setInterval(checkLocalStorage, STORAGE_POLL_INTERVAL)

    // Check immediately in case result is already there
    checkLocalStorage()

    return () => {
      clearInterval(pollInterval)
    }
  }, [dispatch, history])

  return null
}

export default GlobalAzureAuth
