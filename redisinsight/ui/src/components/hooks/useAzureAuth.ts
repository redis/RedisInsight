import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getConfig } from 'uiSrc/config'

import {
  azureAuthSelector,
  initiateAzureLoginAction,
} from 'uiSrc/slices/oauth/azure'
import { AzureLoginSource } from 'uiSrc/slices/interfaces'
import { addMessageNotification } from 'uiSrc/slices/app/notifications'
import { AppDispatch } from 'uiSrc/slices/store'

const riConfig = getConfig()
const isElectron = riConfig.app.type === 'ELECTRON'
const isDevelopment = riConfig.app.env === 'development'

export const useAzureAuth = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { loading, account, error } = useSelector(azureAuthSelector)

  const openAuthUrl = useCallback((url: string) => {
    window.open(url, '_blank')
  }, [])

  const initiateLogin = useCallback(
    (source: AzureLoginSource = AzureLoginSource.Autodiscovery) => {
      if (!isElectron) {
        if (isDevelopment) {
          dispatch(
            addMessageNotification({
              title: 'Azure OAuth requires Electron',
              message:
                'Run the app with `yarn dev:desktop` to use Azure authentication.',
            }),
          )
        }
        return
      }

      dispatch(initiateAzureLoginAction({ source, onSuccess: openAuthUrl }))
    },
    [dispatch, openAuthUrl],
  )

  /**
   * Switch to a different Azure account by showing the account picker.
   * Uses 'select_account' prompt to force Azure to show account selection.
   */
  const switchAccount = useCallback(() => {
    if (!isElectron) {
      return
    }

    dispatch(
      initiateAzureLoginAction({
        source: AzureLoginSource.Autodiscovery,
        onSuccess: openAuthUrl,
        prompt: 'select_account',
      }),
    )
  }, [dispatch, openAuthUrl])

  return {
    loading,
    account,
    error,
    initiateLogin,
    switchAccount,
  }
}

export default useAzureAuth
