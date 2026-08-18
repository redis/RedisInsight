import { secondsToMinutes } from 'uiSrc/utils/transformers/formatDate'
import i18n from 'uiSrc/i18n'

enum ApiErrors {
  SentinelParamsRequired = 'SENTINEL_PARAMS_REQUIRED',
  KeytarUnavailable = 'KeytarUnavailable',
  KeytarEncryption = 'KeytarEncryptionError',
  KeytarDecryption = 'KeytarDecryptionError',
  ClientNotFound = 'ClientNotFoundError',
  RedisearchIndexNotFound = 'no such index',
  ConnectionLost = 'The connection to the server has been lost.',
}

export const ApiEncryptionErrors: string[] = [
  ApiErrors.KeytarUnavailable,
  ApiErrors.KeytarEncryption,
  ApiErrors.KeytarDecryption,
]

export const AI_CHAT_ERRORS = {
  default: () => i18n.t('browser.aiChat.error.default'),
  unexpected: () => i18n.t('browser.aiChat.error.unexpected'),
  timeout: () => i18n.t('browser.aiChat.error.timeout'),
  rateLimit: (limit?: number) =>
    limit
      ? i18n.t('browser.aiChat.error.rateLimitWithTime', {
          time: secondsToMinutes(limit),
        })
      : i18n.t('browser.aiChat.error.rateLimit'),
  tokenLimit: () => i18n.t('browser.aiChat.error.tokenLimit'),
}

export default ApiErrors
