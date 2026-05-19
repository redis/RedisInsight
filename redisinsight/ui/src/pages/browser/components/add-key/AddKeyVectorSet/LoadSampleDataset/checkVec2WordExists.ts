import { AxiosError } from 'axios'

import { apiService } from 'uiSrc/services'
import { ApiEndpoints } from 'uiSrc/constants'
import { getUrl, stringToBuffer } from 'uiSrc/utils'

import { VEC2WORD_COLLECTION_NAME } from './data'

/**
 * Pre-flight check: does the `vec2word` key already exist in the connected
 * database? Returns true on a successful KEY_INFO response, false on 404,
 * and rethrows on any other error so the caller can surface a generic
 * failure toast.
 */
export const checkVec2WordExists = async (
  instanceId: string,
): Promise<boolean> => {
  try {
    await apiService.post(getUrl(instanceId, ApiEndpoints.KEY_INFO), {
      keyName: stringToBuffer(VEC2WORD_COLLECTION_NAME),
    })
    return true
  } catch (err) {
    if ((err as AxiosError)?.response?.status === 404) return false
    throw err
  }
}
