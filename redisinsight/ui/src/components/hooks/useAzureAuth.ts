import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getConfig } from 'uiSrc/config'

import {
  azureAuthSelector,
  initiateAzureLoginAction,
} from 'uiSrc/slices/oauth/azure'
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

  const initiateLogin = useCallback(() => {
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

    dispatch(initiateAzureLoginAction(openAuthUrl))
  }, [dispatch, openAuthUrl])

  return {
    loading,
    account,
    error,
    initiateLogin,
  }
}

export default useAzureAuth
