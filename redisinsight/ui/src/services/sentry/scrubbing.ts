import type { Breadcrumb, Event, StackFrame } from '@sentry/core'

/**
 * Shared, SDK-agnostic Sentry scrubbing / minimization helpers, used by both the
 * Electron main process and the renderer so the two layers cannot drift.
 */

export const REDACTED = '[REDACTED]'

/** Shared anonymous id for no-consent events; mirrors the API analytics service. */
export const NON_TRACKING_ANONYMOUS_ID = '00000000-0000-0000-0000-000000000001'

/** Key-name substrings (case-insensitive) whose values get redacted. */
export const SENSITIVE_FIELDS = [
  'password',
  'pass',
  'passphrase',
  'secret',
  'token',
  'apikey',
  'api_key',
  'privatekey',
  'private_key',
  'certificate',
  'cert',
  'clientcert',
  'clientkey',
  'cacert',
  'sshpassphrase',
  'sshprivatekey',
  'sentinelpassword',
  'credential',
  'authorization',
]

/** Redact values whose KEY name looks sensitive. */
export const scrubSensitiveData = (obj: unknown): unknown => {
  if (!obj || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => scrubSensitiveData(item))
  }

  const scrubbed: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase()
    const isSensitive = SENSITIVE_FIELDS.some((field) =>
      lowerKey.includes(field),
    )

    if (isSensitive) {
      scrubbed[key] = REDACTED
    } else if (typeof value === 'object' && value !== null) {
      scrubbed[key] = scrubSensitiveData(value)
    } else {
      scrubbed[key] = value
    }
  }

  return scrubbed
}

/** Credentials in a URI's userinfo: redis://user:pass@host -> redis://[REDACTED]@host. */
const URI_CREDENTIALS = /([a-z][a-z0-9+.-]*:\/\/)[^/\s@]+@/gi

/** Redact the token after a Bearer/Basic auth scheme. */
const AUTH_SCHEME = /\b(bearer|basic)\s+[\w.+/=~-]+/gi

/** Redact secret-ish `key=value` / `key: value` assignments (incl. access_token, apiKey, …). */
const SECRET_ASSIGNMENT =
  /\b((?:(?:access|refresh|id|client|app)[_-]?)?(?:pass(?:word|phrase|wd)?|pwd|secret|token|api[_-]?key|apikey|auth(?:orization)?|credentials?))(\s*[:=]\s*)("[^"]*"|'[^']*'|\S+)/gi

/**
 * Redact secrets embedded in free text. Best-effort/heuristic; Sentry's
 * server-side data scrubbing is the authoritative backstop.
 */
export const scrubSecretsInText = (text?: string): string | undefined => {
  if (!text) return text
  return text
    .replace(URI_CREDENTIALS, `$1${REDACTED}@`)
    .replace(AUTH_SCHEME, (_match, scheme) => `${scheme} ${REDACTED}`)
    .replace(SECRET_ASSIGNMENT, `$1$2${REDACTED}`)
}

/** Run scrubSecretsInText over every string in a structured value (catches secrets in values, e.g. data.url). */
const scrubSecretsDeep = (value: unknown): unknown => {
  if (typeof value === 'string') {
    return scrubSecretsInText(value)
  }
  if (Array.isArray(value)) {
    return value.map((item) => scrubSecretsDeep(item))
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [key, scrubSecretsDeep(val)]),
    )
  }
  return value
}

/** Replace the OS-user segment of a path with `<user>` (e.g. /Users/jane -> /Users/<user>). */
export const normalizePath = (filePath?: string): string | undefined => {
  if (!filePath) return filePath
  return filePath
    .replace(/(\/(?:Users|home)\/)[^/]+/gi, '$1<user>')
    .replace(/([A-Za-z]:\\Users\\)[^\\]+/gi, '$1<user>')
}

const normalizeFrame = (frame: StackFrame): StackFrame => ({
  ...frame,
  filename: normalizePath(frame.filename),
  abs_path: normalizePath(frame.abs_path),
  // Source context can contain secrets.
  context_line: scrubSecretsInText(frame.context_line),
  pre_context: frame.pre_context?.map(
    (line) => scrubSecretsInText(line) ?? line,
  ),
  post_context: frame.post_context?.map(
    (line) => scrubSecretsInText(line) ?? line,
  ),
})

const normalizeFrames = (event: Event): void => {
  event.exception?.values?.forEach((value) => {
    if (value.stacktrace?.frames) {
      value.stacktrace.frames = value.stacktrace.frames.map(normalizeFrame)
    }
  })
}

/** Applied to every event (both tiers): redact sensitive data, normalize paths, strip host/IP. */
export const scrubEvent = <T extends Event>(event: T): T => {
  // Secrets can live inside string values, which key-name redaction misses.
  if (typeof event.message === 'string') {
    event.message = scrubSecretsInText(event.message) ?? event.message
  }
  if (event.exception?.values) {
    event.exception.values.forEach((value) => {
      if (typeof value.value === 'string') {
        value.value = scrubSecretsInText(value.value) ?? value.value
      }
    })
  }

  // Redact by key name (scrubSensitiveData) AND scrub secrets inside string
  // values (scrubSecretsDeep) — a token in `data.url` lives in a value, not a key.
  if (event.extra) {
    event.extra = scrubSecretsDeep(
      scrubSensitiveData(event.extra),
    ) as Event['extra']
  }
  if (event.contexts) {
    event.contexts = scrubSecretsDeep(
      scrubSensitiveData(event.contexts),
    ) as Event['contexts']
  }
  if (event.request) {
    const request = scrubSecretsDeep(
      scrubSensitiveData(event.request),
    ) as Event['request']
    // request.url can be a file:///C:/Users/<name>/… path on Windows.
    if (request && typeof request.url === 'string') {
      request.url = normalizePath(request.url) ?? request.url
    }
    event.request = request
  }
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map(
      (breadcrumb): Breadcrumb => ({
        ...breadcrumb,
        message: scrubSecretsInText(breadcrumb.message),
        data: scrubSecretsDeep(
          scrubSensitiveData(breadcrumb.data),
        ) as Breadcrumb['data'],
      }),
    )
  }

  normalizeFrames(event)

  event.server_name = undefined
  if (event.user) {
    delete event.user.ip_address
  }

  return event
}

/** Keep only function/location info from a frame; drop locals and source lines. */
const minimizeFrame = (frame: StackFrame): StackFrame => ({
  function: frame.function,
  module: frame.module,
  filename: normalizePath(frame.filename),
  // Kept (with debug_meta) for debug-id symbolication.
  abs_path: normalizePath(frame.abs_path),
  lineno: frame.lineno,
  colno: frame.colno,
  in_app: frame.in_app,
})

/** Keep debug-image references (code_file + debug_id) so Tier-1 stacks still symbolicate; no PII. */
const minimizeDebugMeta = (
  debugMeta: Event['debug_meta'],
): Event['debug_meta'] => {
  if (!debugMeta?.images) return debugMeta
  return {
    ...debugMeta,
    images: debugMeta.images.map((image) => {
      const codeFile = (image as { code_file?: string }).code_file
      if (typeof codeFile !== 'string') return image
      return { ...image, code_file: normalizePath(codeFile) } as typeof image
    }),
  }
}

/**
 * Reduce an event to the Tier 1 (no-consent) allowlist: error type + sanitized
 * stack + build/OS metadata under the shared anonymous id. Drops message,
 * breadcrumbs, request, extra, user identity, and device context.
 */
export const minimizeEvent = <T extends Event>(event: T): T => {
  const minimized: Event = {
    event_id: event.event_id,
    timestamp: event.timestamp,
    platform: event.platform,
    level: event.level,
    release: event.release,
    environment: event.environment,
    debug_meta: minimizeDebugMeta(event.debug_meta),
    exception: event.exception
      ? {
          values: event.exception.values?.map((value) => ({
            type: value.type,
            // Drop the message — free text, may contain data.
            value: '',
            mechanism: value.mechanism,
            stacktrace: value.stacktrace?.frames
              ? { frames: value.stacktrace.frames.map(minimizeFrame) }
              : undefined,
          })),
        }
      : undefined,
    // OS + runtime only; device context can identify the machine.
    contexts: {
      os: event.contexts?.os,
      runtime: event.contexts?.runtime,
    },
    tags: { ...event.tags, tier: 'anonymous' },
    user: { id: NON_TRACKING_ANONYMOUS_ID },
  }

  return minimized as unknown as T
}

/* ------------------------------------------------------------------ *
 * Noise filtering & grouping (RI-8353)
 * ------------------------------------------------------------------ */

/** Every stack frame across all exception values (Sentry order: crash frame last). */
const eventFrames = (event: Event): StackFrame[] =>
  event.exception?.values?.flatMap((value) => value.stacktrace?.frames ?? []) ??
  []

/** Message + every exception `value`/`type`, joined into one searchable string. */
const eventText = (event: Event): string => {
  const parts: string[] = []
  if (typeof event.message === 'string') parts.push(event.message)
  event.exception?.values?.forEach((value) => {
    if (typeof value.value === 'string') parts.push(value.value)
    if (typeof value.type === 'string') parts.push(value.type)
  })
  return parts.join(' ')
}

/** True when any listed error code appears as a whole word in the event text. */
const hasErrorCode = (event: Event, codes: readonly string[]): boolean => {
  const text = eventText(event)
  return codes.some((code) => new RegExp(`\\b${code}\\b`).test(text))
}

/**
 * Node broken-pipe / bad-fd I/O writes surfacing as fatal uncaught errors.
 *
 * Matched on the Node-internal write frame, NOT on the errno alone: EBADF/EIO/
 * EPIPE can also come from genuine app-level socket or file operations that we
 * do want to see, so requiring the storm's stack signature avoids suppressing
 * real crashes that merely share an error code.
 */
const IO_WRITE_FUNCTIONS = ['afterWriteDispatched', 'writeSync', 'onStreamRead']
const isNodeIoWriteNoise = (event: Event): boolean =>
  eventFrames(event).some((frame) => {
    const fn = frame.function ?? ''
    const location = `${frame.module ?? ''} ${frame.filename ?? ''} ${
      frame.abs_path ?? ''
    }`
    const isWriteFn = IO_WRITE_FUNCTIONS.some((name) => fn.includes(name))
    const isNodeInternal =
      location.includes('stream_base_commons') ||
      location.includes('node:') ||
      location.includes('internal/')
    return isWriteFn && isNodeInternal
  })

/** Monaco editor cancellation — a benign `Canceled` throw, never a defect. */
const isMonacoCancellation = (event: Event): boolean =>
  event.exception?.values?.some((value) => value.type === 'Canceled') ?? false

/** Errors thrown from a user's installed browser extension, not our code. */
const EXTENSION_URL_SCHEMES = [
  'chrome-extension://', // Chromium (Electron renderer + Chrome web build)
  'moz-extension://', // Firefox web build
  'safari-web-extension://', // Safari web build
]
const isBrowserExtensionNoise = (event: Event): boolean =>
  eventFrames(event).some((frame) =>
    [frame.filename, frame.abs_path, frame.module].some((source) =>
      EXTENSION_URL_SCHEMES.some((scheme) => (source ?? '').includes(scheme)),
    ),
  )

/** Electron GPU process teardown — environmental, not actionable. */
const isGpuAbnormalExit = (event: Event): boolean => {
  const text = eventText(event)
  return text.includes('abnormal-exit') && text.includes('GPU')
}

/**
 * Decide whether an event is known noise that should never reach Sentry.
 *
 * Must run BEFORE scrub/minimize so it can read the message and error code:
 * `minimizeEvent` blanks those for Tier-1 (no-consent) events, so anything that
 * has to survive anonymization is matched on the stack frame / exception type,
 * which both tiers keep.
 */
export const shouldDropEvent = (event: Event): boolean =>
  isMonacoCancellation(event) ||
  isBrowserExtensionNoise(event) ||
  isNodeIoWriteNoise(event) ||
  isGpuAbnormalExit(event) ||
  // ENOSPC (disk full) is environmental with no app-side fix, so it is safe to
  // match by code alone — unlike EBADF/EIO/EPIPE (see isNodeIoWriteNoise).
  hasErrorCode(event, ['ENOSPC'])

/** Stable fingerprint for the localized "Failed to open: <OS message>" family. */
export const FAILED_TO_OPEN_FINGERPRINT = 'failed-to-open-file'

/**
 * Collapse issues that Sentry's default grouping fragments. Currently the
 * "Failed to open: …" shell errors, which split into one issue per OS locale
 * because the message tail is localized. `sourceEvent` supplies the grouping
 * signals (defaults to `event`); pass the pre-minimized event so the message is
 * still present when fingerprinting a Tier-1 event.
 */
export const applyFingerprint = <T extends Event>(
  event: T,
  sourceEvent: Event = event,
): T => {
  if (eventText(sourceEvent).includes('Failed to open:')) {
    event.fingerprint = [FAILED_TO_OPEN_FINGERPRINT]
  }
  return event
}

/**
 * Single entry point for both layers' `beforeSend`: drop known noise, then
 * scrub, then apply the consent tier, then fingerprint. Returns `null` to drop
 * the event. Lives here (not in each init) so main and renderer cannot drift.
 */
export const finalizeSentryEvent = <T extends Event>(
  event: T,
  analyticsGranted: boolean,
): T | null => {
  if (shouldDropEvent(event)) return null
  const scrubbed = scrubEvent(event)
  const tiered = analyticsGranted ? scrubbed : minimizeEvent(scrubbed)
  // Fingerprint from the original event — minimizeEvent has blanked the message.
  return applyFingerprint(tiered, event)
}
