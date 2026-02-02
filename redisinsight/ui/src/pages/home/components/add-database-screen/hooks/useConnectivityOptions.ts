import { useMemo } from 'react'
import { useSelector } from 'react-redux'

import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { useAzureAuth } from 'uiSrc/components/hooks/useAzureAuth'
import { AddDbType } from 'uiSrc/pages/home/constants'
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
  const featureFlags = useSelector(appFeatureFlagsFeaturesSelector)
  const { initiateLogin, loading: azureLoading } = useAzureAuth()

  return useMemo(() => {
    const getClickHandler = (option: ConnectivityOptionConfig) => {
      if (option.type === AddDbType.azure) {
        return initiateLogin
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
      if (!option.featureFlag) return true
      return featureFlags?.[option.featureFlag]?.flag ?? false
    }

    return CONNECTIVITY_OPTIONS_CONFIG.filter(isFeatureEnabled).map(
      (config) => ({
        ...config,
        onClick: getClickHandler(config),
        loading: getLoadingState(config),
      }),
    )
  }, [featureFlags, initiateLogin, azureLoading, onClickOption])
}
