import { useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'
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
}

export const useConnectivityOptions = ({
  onClickOption,
}: UseConnectivityOptionsProps): ConnectivityOption[] => {
  const history = useHistory()
  const isAzureEntraIdEnabled = useSelector(isAzureEntraIdEnabledSelector)
  const { initiateLogin, loading: azureLoading, account } = useAzureAuth()

  const handleAzureClick = useCallback(() => {
    sendEventTelemetry({
      event: TelemetryEvent.AZURE_IMPORT_DATABASES_CLICKED,
    })
    if (account) {
      history.push(Pages.azureSubscriptions)
    } else {
      initiateLogin()
    }
  }, [account, history, initiateLogin])

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
      }),
    )
  }, [isAzureEntraIdEnabled, handleAzureClick, azureLoading, onClickOption])
}
