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
