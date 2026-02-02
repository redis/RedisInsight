import { useCallback, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getConfig } from 'uiSrc/config'

import {
  azureAuthSelector,
  initiateAzureLoginAction,
  setAzureAuthInitialState,
} from 'uiSrc/slices/oauth/azure'
import { addMessageNotification } from 'uiSrc/slices/app/notifications'
import { AppDispatch } from 'uiSrc/slices/store'

const riConfig = getConfig()
const isElectron = riConfig.app.type === 'ELECTRON'
const isDevelopment = riConfig.app.env === 'development'

const OAUTH_TIMEOUT_MS = 60 * 1000

export const useAzureAuth = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { loading, account, error } = useSelector(azureAuthSelector)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Clear timeout on unmount or when loading becomes false
  useEffect(() => {
    if (!loading && timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [loading])

  const openAuthUrl = useCallback(
    (url: string) => {
      window.open(url, '_blank')

      // Set timeout to reset loading state if OAuth flow is abandoned
      timeoutRef.current = setTimeout(() => {
        dispatch(setAzureAuthInitialState())
      }, OAUTH_TIMEOUT_MS)
    },
    [dispatch],
  )

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
