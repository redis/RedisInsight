import { AxiosError } from 'axios'

import { apiService } from 'uiSrc/services'
import { ApiEndpoints } from 'uiSrc/constants'
import { getUrl, stringToBuffer } from 'uiSrc/utils'

/** Returns true if the key exists, false on 404; rethrows other errors. */
export const checkArrayKeyExists = async (
  instanceId: string,
  keyName: string,
): Promise<boolean> => {
  try {
    await apiService.post(getUrl(instanceId, ApiEndpoints.KEY_INFO), {
      keyName: stringToBuffer(keyName),
    })
    return true
  } catch (err) {
    if ((err as AxiosError)?.response?.status === 404) return false
    throw err
  }
}
