import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'

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
}

const ConfigAzureAuth = () => {
  const dispatch = useDispatch<AppDispatch>()
  const history = useHistory()

  useEffect(() => {
    window.app?.azureOauthCallback?.(azureOauthCallback)
  }, [])

  const azureOauthCallback = (
    _e: unknown,
    { status, account, error }: AzureAuthCallbackResponse,
  ) => {
    if (status === AzureAuthStatus.Succeed && account) {
      const azureAccount = {
        id: account.homeAccountId,
        username: account.username,
        name: account.name,
      }
      dispatch(handleAzureOAuthSuccess(azureAccount))
      dispatch(
        addMessageNotification(
          successMessages.AZURE_AUTH_SUCCESS(account.username),
        ),
      )
      history.push(Pages.azureSubscriptions)
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
