import { apiService } from 'uiSrc/services'
import { ApiEndpoints } from 'uiSrc/constants'
import { getUrl, stringToBuffer } from 'uiSrc/utils'

export const applyKeyTtl = async (
  instanceId: string,
  keyName: string,
  ttl: number,
): Promise<void> => {
  await apiService.patch(getUrl(instanceId, ApiEndpoints.KEY_TTL), {
    keyName: stringToBuffer(keyName),
    ttl,
  })
}
