import { KeyTypes } from 'uiSrc/constants'

enum HighlightType {
  Length = 'length',
  Memory = 'memory',
}

interface DefaultConfig {
  [key: string]: number
}

const defaultMemoryConfig: { [key: string]: number } = {
  memory: 5_000_000,
}

const defaultConfig: { [key: string]: number } = {
  length: 5_000,
  memory: 5_000_000,
}

const bigKeysConfig: { [key: string]: DefaultConfig } = {
  [KeyTypes.List]: defaultConfig,
  [KeyTypes.ZSet]: defaultConfig,
  [KeyTypes.Set]: defaultConfig,
  [KeyTypes.Hash]: defaultConfig,
}

const isBigKey = (
  keyType: string,
  type: HighlightType,
  count: number,
): boolean => {
  if (!count) return false
  if (bigKeysConfig[keyType]?.[type])
    return count >= bigKeysConfig[keyType][type]
  if (defaultMemoryConfig[type]) return count >= defaultMemoryConfig[type]

  return false
}

export { HighlightType, isBigKey }
