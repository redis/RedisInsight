import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import {
  handleAzureOAuthSuccess,
  handleAzureOAuthFailure,
} from 'uiSrc/slices/oauth/azure'
import {
  addErrorNotification,
  addMessageNotification,
} from 'uiSrc/slices/app/notifications'
import { AzureAuthStatus } from 'apiSrc/modules/azure/constants'
import successMessages from 'uiSrc/components/notifications/success-messages'
import { AppDispatch } from 'uiSrc/slices/store'

interface AzureAuthCallbackResponse {
  status: string
  account?: {
    id: string
    username: string
    name?: string
  }
  error?: string
}

const ConfigAzureAuth = () => {
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    window.app?.azureOauthCallback?.(azureOauthCallback)
  }, [])

  const azureOauthCallback = (
    _e: unknown,
    { status, account, error }: AzureAuthCallbackResponse,
  ) => {
    if (status === AzureAuthStatus.Succeed && account) {
      dispatch(handleAzureOAuthSuccess(account))
      dispatch(
        addMessageNotification(
          successMessages.AZURE_AUTH_SUCCESS(account.username),
        ),
      )
      return
    }

    // Handle failure or success without account (edge case)
    if (
      status === AzureAuthStatus.Failed ||
      status === AzureAuthStatus.Succeed
    ) {
      const errorMessage = error || 'Azure authentication failed'
      dispatch(handleAzureOAuthFailure(errorMessage))
      dispatch(
        addErrorNotification({
          response: {
            data: {
              message: errorMessage,
            },
          },
        } as any),
      )
    }
  }

  return null
}

export default ConfigAzureAuth
