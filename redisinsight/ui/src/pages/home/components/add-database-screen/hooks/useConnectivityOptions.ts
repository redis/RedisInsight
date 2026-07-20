import { useCallback, useMemo } from 'react'
import { useAppSelector } from 'uiSrc/slices/hooks'
import { useHistory } from 'react-router-dom'

import { isAzureEntraIdEnabledSelector } from 'uiSrc/slices/app/features'
import { useAzureAuth } from 'uiSrc/components/hooks/useAzureAuth'
import { AddDbType } from 'uiSrc/pages/home/constants'
import { Pages } from 'uiSrc/constants'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  CONNECTIVITY_OPTIONS_CONFIG,
  ConnectivityOption,
  ConnectivityOptionConfig,
} from '../constants'

interface UseConnectivityOptionsProps {
  onClickOption: (type: AddDbType) => void
  /**
   * Called when the user clicks Azure while not signed in. The caller opens the
   * sign-in dialog (where an optional tenant can be entered) instead of starting
   * the OAuth flow immediately.
   */
  onRequestAzureSignIn?: () => void
}

export const useConnectivityOptions = ({
  onClickOption,
  onRequestAzureSignIn,
}: UseConnectivityOptionsProps): ConnectivityOption[] => {
  const history = useHistory()
  const isAzureEntraIdEnabled = useAppSelector(isAzureEntraIdEnabledSelector)
  const { cancelLogin, loading: azureLoading, account } = useAzureAuth()

  const handleAzureClick = useCallback(() => {
    sendEventTelemetry({
      event: TelemetryEvent.AZURE_IMPORT_DATABASES_CLICKED,
    })
    if (account) {
      history.push(Pages.azureSubscriptions)
    } else {
      onRequestAzureSignIn?.()
    }
  }, [account, history, onRequestAzureSignIn])

  return useMemo(() => {
    const getClickHandler = (option: ConnectivityOptionConfig) => {
      if (option.type === AddDbType.azure) {
        return handleAzureClick
      }
      return () => onClickOption(option.type)
    }

    const getLoadingState = (option: ConnectivityOptionConfig) => {
      if (option.type === AddDbType.azure) {
        return azureLoading
      }
      return false
    }

    const getCancelHandler = (option: ConnectivityOptionConfig) => {
      if (option.type === AddDbType.azure) {
        return cancelLogin
      }
      return undefined
    }

    const isFeatureEnabled = (option: ConnectivityOptionConfig) => {
      if (option.type === AddDbType.azure) {
        return isAzureEntraIdEnabled
      }
      return true
    }

    return CONNECTIVITY_OPTIONS_CONFIG.filter(isFeatureEnabled).map(
      (config) => ({
        ...config,
        onClick: getClickHandler(config),
        loading: getLoadingState(config),
        onCancel: getCancelHandler(config),
      }),
    )
  }, [
    isAzureEntraIdEnabled,
    handleAzureClick,
    azureLoading,
    cancelLogin,
    onClickOption,
  ])
}
