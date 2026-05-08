import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { Nullable, isEqualBuffers } from 'uiSrc/utils'

/**
 * Compare two key identifiers (`RedisResponseBuffer`s) for equality.
 * Falls back to reference identity when both sides are strictly equal and
 * treats `null`/`undefined` as never-equal-to-a-buffer so the consumer can
 * detect first-mount vs key-change without spurious resets.
 */
export const areKeysEqual = (
  a: Nullable<RedisResponseBuffer> | undefined,
  b: Nullable<RedisResponseBuffer> | undefined,
): boolean => {
  if (a === b) return true
  if (a == null || b == null) return false
  return isEqualBuffers(a, b)
}
