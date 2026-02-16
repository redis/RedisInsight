import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

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
import { AzureAuthStatus } from 'apiSrc/modules/azure/constants'
import { AppDispatch } from 'uiSrc/slices/store'
import { Pages } from 'uiSrc/constants'

interface MsalAccountInfo {
  homeAccountId: string
  username: string
  name?: string
}

interface AzureAuthCallbackResponse {
  status: string
  account?: MsalAccountInfo
  error?: string
  errorCode?: number
}

const ConfigAzureAuth = () => {
  const dispatch = useDispatch<AppDispatch>()
  const history = useHistory()
  const source = useSelector(azureAuthSourceSelector)
  const sourceRef = useRef(source)
  sourceRef.current = source

  useEffect(() => {
    window.app?.azureOauthCallback?.(azureOauthCallback)
  }, [])

  const azureOauthCallback = (
    _e: unknown,
    { status, account, error, errorCode }: AzureAuthCallbackResponse,
  ) => {
    if (status === AzureAuthStatus.Succeed && account) {
      const azureAccount = {
        id: account.homeAccountId,
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

      // Show success notification only for token refresh (login from error notification)
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

    // Handle failure or success without account (edge case)
    const errorMessage = error || 'Azure authentication failed'
    dispatch(handleAzureOAuthFailure(errorMessage))
    dispatch(
      addErrorNotification({
        response: {
          data: {
            message: errorMessage,
            additionalInfo: errorCode ? { errorCode } : undefined,
          },
        },
      } as any),
    )
  }

  return null
}

export default ConfigAzureAuth
