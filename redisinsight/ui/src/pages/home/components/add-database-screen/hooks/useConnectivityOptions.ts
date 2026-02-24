import { useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
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
  const featureFlags = useSelector(appFeatureFlagsFeaturesSelector)
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
      if (!option.featureFlags?.length) return true
      return option.featureFlags.every(
        (flag) => featureFlags?.[flag]?.flag ?? false,
      )
    }

    return CONNECTIVITY_OPTIONS_CONFIG.filter(isFeatureEnabled).map(
      (config) => ({
        ...config,
        onClick: getClickHandler(config),
        loading: getLoadingState(config),
      }),
    )
  }, [featureFlags, handleAzureClick, azureLoading, onClickOption])
}
