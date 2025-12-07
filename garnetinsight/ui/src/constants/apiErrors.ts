import { secondsToMinutes } from 'uiSrc/utils/transformers/formatDate'

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
  default: () => 'An error occurred. Try again or restart the session.',
  unexpected: () => 'An unexpected error occurred. Try again later.',
  timeout: () => 'Timeout occurred. Try again later.',
  rateLimit: (limit?: number) => {
    let error = 'Exceeded rate limit.'
    if (limit) {
      error += ` Try again in ${secondsToMinutes(limit)}.`
    }

    return error
  },
  tokenLimit: () => 'Conversation is too long. Restart the session.',
}

export default ApiErrors
