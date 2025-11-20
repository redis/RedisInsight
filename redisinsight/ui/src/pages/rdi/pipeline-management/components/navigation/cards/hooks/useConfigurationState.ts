import { useSelector } from 'react-redux'
import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'

export interface ConfigurationState {
  hasChanges: boolean
  isValid: boolean
  configValidationErrors: string[]
}

export const useConfigurationState = (): ConfigurationState => {
  const { changes, configValidationErrors } = useSelector(rdiPipelineSelector)

  const hasChanges = !!changes.config
  const isValid = configValidationErrors.length === 0

  return {
    hasChanges,
    isValid,
    configValidationErrors,
  }
}
