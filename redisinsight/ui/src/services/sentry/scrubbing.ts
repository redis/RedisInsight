import type { Breadcrumb, Event, StackFrame } from '@sentry/core'

/**
 * Shared Sentry scrubbing / minimization helpers.
 *
 * Used by BOTH the Electron main process (`desktopSrc`, via the `uiSrc` alias)
 * and the renderer (`uiSrc`) so the two layers cannot drift. Keep this module
 * SDK-agnostic: it operates on the `@sentry/core` `Event` shape (type-only
 * import) and must not import `@sentry/react`, `@sentry/electron`, Node, or
 * browser globals.
 *
 * See docs/sentry-production-readiness.md (§4, §6).
 */

export const REDACTED = '[REDACTED]'

/**
 * Fixed anonymous id used for the no-consent (Tier 1) payload. Mirrors
 * `NON_TRACKING_ANONYMOUS_ID` in
 * `api/src/modules/analytics/analytics.service.ts` — every non-consenting user
 * shares this id so individuals cannot be distinguished.
 */
export const NON_TRACKING_ANONYMOUS_ID = '00000000-0000-0000-0000-000000000001'

/**
 * Sensitive field-name substrings (case-insensitive). Any key containing one of
 * these is redacted. Defense-in-depth — prefer also minimizing what is sent.
 */
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

/**
 * Recursively redact sensitive values from an arbitrary object/array.
 */
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

/**
 * Credentials embedded in a connection URI's userinfo:
 *   redis://user:pass@host:6379  ->  redis://[REDACTED]@host:6379
 * Covers this app's most likely leak — Redis connection strings (redis://,
 * rediss://) carrying a password inside a thrown error or log line. Only URIs
 * with userinfo (an `@` before the host) match, so plain URLs are left intact.
 */
const URI_CREDENTIALS = /([a-z][a-z0-9+.-]*:\/\/)[^/\s@]+@/gi

/**
 * `Authorization: Bearer <token>` / `Basic <creds>` — redact the credential
 * after the scheme. The assignment pattern below would only catch the scheme
 * word ("Bearer") and leave the token, so this runs first.
 */
const AUTH_SCHEME = /\b(bearer|basic)\s+[\w.+/=~-]+/gi

/**
 * `password=...`, `token: ...`, `apiKey="..."`, `access_token=...` style
 * assignments. Keyword-driven like SENSITIVE_FIELDS, with an optional OAuth
 * prefix (access_/refresh_/id_/client_/app_) so `access_token`, `refreshToken`,
 * etc. are caught. The required `=`/`:` separator stops it matching unrelated
 * words ("tokenizer", "compass").
 */
const SECRET_ASSIGNMENT =
  /\b((?:(?:access|refresh|id|client|app)[_-]?)?(?:pass(?:word|phrase|wd)?|pwd|secret|token|api[_-]?key|apikey|auth(?:orization)?|credentials?))(\s*[:=]\s*)("[^"]*"|'[^']*'|\S+)/gi

/**
 * Redact secrets embedded in FREE-TEXT (error messages, breadcrumb messages,
 * URLs, source-context lines). `scrubSensitiveData` only redacts by key NAME,
 * so a secret living inside a string value — e.g. a Redis URI in a thrown
 * error — would otherwise survive on the consented path. Best-effort
 * (heuristic) defense-in-depth, not a guarantee; the authoritative backstop is
 * Sentry's server-side data scrubbing.
 */
export const scrubSecretsInText = (text?: string): string | undefined => {
  if (!text) return text
  return text
    .replace(URI_CREDENTIALS, `$1${REDACTED}@`)
    .replace(AUTH_SCHEME, (_match, scheme) => `${scheme} ${REDACTED}`)
    .replace(SECRET_ASSIGNMENT, `$1$2${REDACTED}`)
}

/**
 * Recursively run `scrubSecretsInText` over every string in a structured value.
 * `scrubSensitiveData` only redacts by key NAME, so this is what catches secrets
 * that live inside string VALUES — e.g. a token in a breadcrumb's `data.url`.
 */
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

/**
 * Replace the OS-user segment of a filesystem path with `<user>` so stack-frame
 * paths cannot leak the account/owner name (PII).
 *   /Users/jane/...        -> /Users/<user>/...
 *   /home/jane/...         -> /home/<user>/...
 *   C:\Users\jane\...      -> C:\Users\<user>\...
 */
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
  // Source context lines can contain hard-coded secrets.
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

/**
 * Applied to EVERY event (both tiers). Redacts sensitive fields from the
 * structured bags, normalizes stack-frame paths, scrubs breadcrumb data, and
 * strips host/IP identifiers that Sentry would otherwise attach.
 */
export const scrubEvent = <T extends Event>(event: T): T => {
  // Free-text fields: redact secrets embedded inside the string itself, since
  // scrubSensitiveData only redacts by key name (a Redis URI in the message
  // would otherwise pass through on the consented path).
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

  // Structured bags: redact by key name (scrubSensitiveData) AND scrub secrets
  // inside string values (scrubSecretsDeep) — a token in `data.url`/`request.url`
  // lives in a value, not a sensitive key, so key-redaction alone misses it.
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
    // The page URL can be a file:///C:/Users/<name>/… path on Windows.
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

  // Never report the machine hostname (often contains the owner's name).
  event.server_name = undefined
  // Never store the client IP.
  if (event.user) {
    delete event.user.ip_address
  }

  return event
}

/**
 * Keep only function/module/location info from a stack frame; drop locals,
 * surrounding source lines, and anything free-text.
 */
const minimizeFrame = (frame: StackFrame): StackFrame => ({
  function: frame.function,
  module: frame.module,
  filename: normalizePath(frame.filename),
  // Kept (with debug_meta) so debug-id symbolication still works; it is a build
  // path (app:///…), normalized in case it ever carries a user directory.
  abs_path: normalizePath(frame.abs_path),
  lineno: frame.lineno,
  colno: frame.colno,
  in_app: frame.in_app,
})

/**
 * Keep the debug-image references (code_file + debug_id) so Tier-1 events still
 * symbolicate against uploaded source maps. These carry no PII — build paths +
 * debug-id UUIDs — but code_file is normalized defensively in case a
 * main-process image ever holds an absolute user path.
 */
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
 * stack + build/OS metadata, under the shared anonymous id. Drops the message,
 * breadcrumbs, request, extra, user identity, and device context. Keeps
 * debug_meta so the (anonymous) stack still symbolicates — it carries no PII.
 *
 * `scrubEvent` should be applied before this; `minimizeEvent` is the final
 * gate for the no-consent path.
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
            // Drop the message — it is free text and may contain data.
            value: '',
            mechanism: value.mechanism,
            stacktrace: value.stacktrace?.frames
              ? { frames: value.stacktrace.frames.map(minimizeFrame) }
              : undefined,
          })),
        }
      : undefined,
    // Only non-identifying contexts: OS + runtime versions. Device context can
    // carry the machine name / serial, so it is intentionally omitted.
    contexts: {
      os: event.contexts?.os,
      runtime: event.contexts?.runtime,
    },
    tags: { ...event.tags, tier: 'anonymous' },
    user: { id: NON_TRACKING_ANONYMOUS_ID },
  }

  // The minimized object is a deliberate subset of the incoming event type.
  return minimized as unknown as T
}
