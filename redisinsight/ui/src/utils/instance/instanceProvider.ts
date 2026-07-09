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

/**
 * A database is "managed" when its endpoint is owned by a cloud provider
 * (Redis Cloud subscription or Azure). For such databases the host/port are
 * tied to provider metadata that would become stale if edited manually, so the
 * endpoint must stay read-only. Mirrors DatabaseService.isManagedDatabase on
 * the backend.
 */
export const isManagedDatabase = (
  instance: Nullable<Partial<Instance>>,
): boolean => isAzureDatabase(instance) || !!instance?.cloudDetails?.cloudId
