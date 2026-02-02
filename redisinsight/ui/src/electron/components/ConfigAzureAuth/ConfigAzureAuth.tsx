import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import {
  azureOAuthCallbackSuccess,
  azureOAuthCallbackFailure,
} from 'uiSrc/slices/oauth/azure'
import {
  addErrorNotification,
  addMessageNotification,
} from 'uiSrc/slices/app/notifications'
import { AzureAuthStatus } from 'apiSrc/modules/azure/constants'
import successMessages from 'uiSrc/components/notifications/success-messages'

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
  const dispatch = useDispatch()

  useEffect(() => {
    window.app?.azureOauthCallback?.(azureOauthCallback)
  }, [])

  const azureOauthCallback = (
    _e: unknown,
    { status, account, error }: AzureAuthCallbackResponse,
  ) => {
    if (status === AzureAuthStatus.Succeed && account) {
      dispatch(azureOAuthCallbackSuccess(account))
      dispatch(
        addMessageNotification(
          successMessages.AZURE_AUTH_SUCCESS(account.username),
        ),
      )
    }

    if (status === AzureAuthStatus.Failed) {
      const errorMessage = error || 'Azure authentication failed'
      dispatch(azureOAuthCallbackFailure(errorMessage))
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
