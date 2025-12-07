import { useSelector } from 'react-redux'
import { useCallback } from 'react'
import { WsParams, wsService } from 'uiSrc/services/wsService'
import { FeatureFlags } from 'uiSrc/constants'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'

export const useIoConnection = (url: string, params: WsParams) => {
  const { [FeatureFlags.envDependent]: envDependent } = useSelector(
    appFeatureFlagsFeaturesSelector,
  )
  return useCallback(
    () => wsService(url, params, envDependent?.flag),
    [url, params, envDependent],
  )
}
