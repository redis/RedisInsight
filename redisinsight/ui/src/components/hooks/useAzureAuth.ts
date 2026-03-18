import { useCallback, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getConfig } from 'uiSrc/config'

import {
  azureAuthSelector,
  AzureOAuthPrompt,
  AzureOAuthRedirectType,
  initiateAzureLoginAction,
} from 'uiSrc/slices/oauth/azure'
import { AzureLoginSource } from 'uiSrc/slices/interfaces'
import { AppDispatch } from 'uiSrc/slices/store'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'

const riConfig = getConfig()
const isElectron = riConfig.app.type === 'ELECTRON'

const AZURE_LOCALHOST_ERROR_MESSAGE =
  'Azure authentication requires accessing RedisInsight via localhost. ' +
  'Please use http://localhost:PORT instead of IP addresses or custom domains.'

// Popup window dimensions for OAuth
const POPUP_WIDTH = 500
const POPUP_HEIGHT = 700

export const useAzureAuth = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { loading, account, error } = useSelector(azureAuthSelector)
  const popupRef = useRef<Window | null>(null)

  const openAuthUrl = useCallback((url: string) => {
    if (isElectron) {
      // Electron: open in system browser, deeplink will handle callback
      window.open(url, '_blank')
    } else {
      // Web: open popup window, localStorage polling will handle callback
      const left = window.screenX + (window.innerWidth - POPUP_WIDTH) / 2
      const top = window.screenY + (window.innerHeight - POPUP_HEIGHT) / 2
      const features = `width=${POPUP_WIDTH},height=${POPUP_HEIGHT},left=${left},top=${top},popup=yes`

      // Close any existing popup
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close()
      }

      popupRef.current = window.open(url, 'azureOAuthPopup', features)
    }
  }, [])

  const initiateLogin = useCallback(
    (source: AzureLoginSource = AzureLoginSource.Autodiscovery) => {
      // In web mode, Azure OAuth only works when accessed via localhost
      // due to Azure's redirect URI restrictions for public client apps
      if (!isElectron && window.location.hostname !== 'localhost') {
        dispatch(
          addErrorNotification({
            response: {
              data: {
                message: AZURE_LOCALHOST_ERROR_MESSAGE,
              },
            },
          } as any),
        )
        return
      }

      const redirectType = isElectron
        ? AzureOAuthRedirectType.Deeplink
        : AzureOAuthRedirectType.Web

      dispatch(
        initiateAzureLoginAction({
          source,
          onSuccess: openAuthUrl,
          prompt: AzureOAuthPrompt.SelectAccount,
          redirectType,
        }),
      )
    },
    [dispatch, openAuthUrl],
  )

  return {
    loading,
    account,
    error,
    initiateLogin,
  }
}

export default useAzureAuth
