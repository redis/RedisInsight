import { isString } from 'lodash'
import { getConfig } from 'uiSrc/config'
import {
  RedisResponseBuffer,
  RedisResponseBufferType,
  RedisString,
} from 'uiSrc/slices/interfaces'
import { Nullable } from 'uiSrc/utils/types'

const BIG_STRING_PREFIX = getConfig().app.truncatedStringPrefix
const BIG_STRING_PREFIX_BUFFER = Uint8Array.from(
  Array.from(BIG_STRING_PREFIX).map((letter) => letter.charCodeAt(0)),
)

const redisResponseBufferStartsWith = (
  value: RedisResponseBuffer,
  subBuffer: Uint8Array,
) => {
  if (subBuffer.length > value.length) {
    return false
  }

  return subBuffer.every((v, i) => v === value[i])
}

export const isTruncatedString = (value: Nullable<RedisString>) => {
  if (!value) {
    return false
  }

  try {
    if (isString(value)) {
      if (value[0] === '"') {
        return value.indexOf(BIG_STRING_PREFIX) === 1
      }

      return value.startsWith(BIG_STRING_PREFIX)
    }

    if (value.type === RedisResponseBufferType.Buffer && value.data) {
      return redisResponseBufferStartsWith(value.data, BIG_STRING_PREFIX_BUFFER)
    }
  } catch (e) {
    // ignore error
  }

  return false
}
