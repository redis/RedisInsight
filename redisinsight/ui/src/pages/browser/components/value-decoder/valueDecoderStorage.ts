import BrowserStorageItem from 'uiSrc/constants/storage'
import { localStorageService } from 'uiSrc/services'

import { normalizeRule } from './schemaUtils'
import { ValueDecoderRule } from './types'

const LEGACY_GLOBAL_VALUE_DECODER_RULES_KEY = 'valueDecoderRules'

export const getValueDecoderRulesStorageKey = (instanceId: string) =>
  BrowserStorageItem.valueDecoderRules + instanceId

export const getValueDecoderRules = (
  instanceId: string,
): ValueDecoderRule[] => {
  if (!instanceId) {
    return []
  }

  const storageKey = getValueDecoderRulesStorageKey(instanceId)
  let raw: ValueDecoderRule[] | null = localStorageService?.get(storageKey)

  if (!raw?.length) {
    const legacyRules: ValueDecoderRule[] | null = localStorageService?.get(
      LEGACY_GLOBAL_VALUE_DECODER_RULES_KEY,
    )

    if (legacyRules?.length) {
      localStorageService.set(storageKey, legacyRules)
      localStorageService.remove(LEGACY_GLOBAL_VALUE_DECODER_RULES_KEY)
      raw = legacyRules
    }
  }

  return (raw ?? []).map(normalizeRule)
}

export const setValueDecoderRules = (
  instanceId: string,
  decoders: ValueDecoderRule[],
): void => {
  if (!instanceId) {
    return
  }

  localStorageService?.set(getValueDecoderRulesStorageKey(instanceId), decoders)
}

export const removeValueDecoderRules = (instanceId: string): void => {
  if (!instanceId) {
    return
  }

  localStorageService?.remove(getValueDecoderRulesStorageKey(instanceId))
}
