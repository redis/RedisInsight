export {
  REDACTED,
  NON_TRACKING_ANONYMOUS_ID,
  SENSITIVE_FIELDS,
  scrubSensitiveData,
  normalizePath,
  scrubEvent,
  minimizeEvent,
  shouldDropEvent,
  applyFingerprint,
  finalizeSentryEvent,
  FAILED_TO_OPEN_FINGERPRINT,
} from './scrubbing'
