import { Instance } from 'uiSrc/slices/interfaces'
import { Nullable } from 'uiSrc/utils/types'

const AZURE_PROVIDER = 'azure'

export const isAzureDatabase = (
  instance: Nullable<Partial<Instance>>,
): boolean => {
  if (!instance?.providerDetails) {
    return false
  }

  return instance.providerDetails.provider === AZURE_PROVIDER
}
