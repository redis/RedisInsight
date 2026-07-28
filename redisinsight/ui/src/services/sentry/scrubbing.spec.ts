import type { Event } from '@sentry/core'
import {
  FAILED_TO_OPEN_FINGERPRINT,
  NON_TRACKING_ANONYMOUS_ID,
  REDACTED,
  applyFingerprint,
  finalizeSentryEvent,
  minimizeEvent,
  normalizePath,
  scrubEvent,
  scrubSecretsInText,
  scrubSensitiveData,
  shouldDropEvent,
} from './scrubbing'

/** Build an event with a single exception value + stack frames. */
const errorEvent = (
  value: string,
  frames: Array<Record<string, unknown>> = [],
  type = 'Error',
): Event => ({
  exception: { values: [{ type, value, stacktrace: { frames } }] },
})

describe('scrubSensitiveData', () => {
  it('redacts keys whose name contains a sensitive substring', () => {
    const result = scrubSensitiveData({
      password: 'p',
      sentinelPassword: 's',
      apiKey: 'k',
      authorization: 'Bearer x',
      host: 'localhost',
    }) as Record<string, unknown>

    expect(result.password).toBe(REDACTED)
    expect(result.sentinelPassword).toBe(REDACTED)
    expect(result.apiKey).toBe(REDACTED)
    expect(result.authorization).toBe(REDACTED)
    expect(result.host).toBe('localhost')
  })

  it('redacts nested objects and arrays', () => {
    const result = scrubSensitiveData({
      connection: { token: 't', port: 6379 },
      list: [{ secret: 'a' }, { name: 'ok' }],
    }) as any

    expect(result.connection.token).toBe(REDACTED)
    expect(result.connection.port).toBe(6379)
    expect(result.list[0].secret).toBe(REDACTED)
    expect(result.list[1].name).toBe('ok')
  })

  it('passes through primitives and null', () => {
    expect(scrubSensitiveData(null)).toBeNull()
    expect(scrubSensitiveData('plain')).toBe('plain')
    expect(scrubSensitiveData(42)).toBe(42)
  })
})

describe('scrubSecretsInText', () => {
  it('redacts credentials embedded in connection URIs', () => {
    expect(
      scrubSecretsInText('connect redis://user:p4ss@host:6379 failed'),
    ).toBe(`connect redis://${REDACTED}@host:6379 failed`)
    expect(scrubSecretsInText('rediss://default:secret@h')).toBe(
      `rediss://${REDACTED}@h`,
    )
  })

  it('redacts secret assignments in free text', () => {
    expect(scrubSecretsInText('password=hunter2 ok')).toBe(
      `password=${REDACTED} ok`,
    )
    expect(scrubSecretsInText('token: abc.def')).toBe(`token: ${REDACTED}`)
    expect(scrubSecretsInText('apiKey="xyz"')).toBe(`apiKey=${REDACTED}`)
  })

  it('redacts bearer tokens and OAuth-style token names', () => {
    const bearer = scrubSecretsInText('Authorization: Bearer abc123xyz')
    expect(bearer).not.toContain('abc123xyz')
    expect(bearer).toContain(REDACTED)

    expect(scrubSecretsInText('access_token=abc123')).toBe(
      `access_token=${REDACTED}`,
    )
    expect(scrubSecretsInText('refreshToken: "r3fr3sh"')).toBe(
      `refreshToken: ${REDACTED}`,
    )
  })

  it('leaves clean text and credential-free URLs intact', () => {
    expect(scrubSecretsInText('connection refused')).toBe('connection refused')
    expect(scrubSecretsInText('https://example.com/api?id=1')).toBe(
      'https://example.com/api?id=1',
    )
    expect(scrubSecretsInText('compass bearing set')).toBe(
      'compass bearing set',
    )
  })

  it('returns falsy input unchanged', () => {
    expect(scrubSecretsInText(undefined)).toBeUndefined()
    expect(scrubSecretsInText('')).toBe('')
  })
})

describe('normalizePath', () => {
  it.each([
    ['/Users/jane/app/main.js', '/Users/<user>/app/main.js'],
    ['/home/jane/app/main.js', '/home/<user>/app/main.js'],
    ['C:\\Users\\jane\\app\\main.js', 'C:\\Users\\<user>\\app\\main.js'],
    // Windows renderer frames arrive as file:// URLs with forward slashes; the
    // `/Users/` branch handles these too (prefix-agnostic).
    ['C:/Users/jane/app/main.js', 'C:/Users/<user>/app/main.js'],
    [
      'file:///C:/Users/jane/app/main.js',
      'file:///C:/Users/<user>/app/main.js',
    ],
  ])('strips the user segment from %s', (input, expected) => {
    expect(normalizePath(input)).toBe(expected)
  })

  it('returns falsy input unchanged', () => {
    expect(normalizePath(undefined)).toBeUndefined()
    expect(normalizePath('')).toBe('')
  })

  it('leaves paths without a user segment intact', () => {
    expect(normalizePath('/app.asar/dist/main.js')).toBe(
      '/app.asar/dist/main.js',
    )
  })
})

describe('scrubEvent', () => {
  it('scrubs extra, contexts, request and breadcrumb data', () => {
    const event: Event = {
      extra: { password: 'p', safe: 1 },
      contexts: { redis: { token: 't' } as any },
      request: { headers: { authorization: 'Bearer x' } },
      breadcrumbs: [{ data: { secret: 's', url: '/keys' } }],
    }

    const result = scrubEvent(event)

    expect((result.extra as any).password).toBe(REDACTED)
    expect((result.extra as any).safe).toBe(1)
    expect((result.contexts as any).redis.token).toBe(REDACTED)
    expect((result.request as any).headers.authorization).toBe(REDACTED)
    expect(result.breadcrumbs?.[0].data?.secret).toBe(REDACTED)
    expect(result.breadcrumbs?.[0].data?.url).toBe('/keys')
  })

  it('normalizes stack-frame paths', () => {
    const event: Event = {
      exception: {
        values: [
          {
            type: 'Error',
            value: 'boom',
            stacktrace: {
              frames: [
                {
                  filename: '/Users/jane/app/x.js',
                  abs_path: '/Users/jane/app/x.js',
                },
              ],
            },
          },
        ],
      },
    }

    const frame = scrubEvent(event).exception!.values![0].stacktrace!.frames![0]
    expect(frame.filename).toBe('/Users/<user>/app/x.js')
    expect(frame.abs_path).toBe('/Users/<user>/app/x.js')
  })

  it('redacts secrets in message, exception value, breadcrumb message and request', () => {
    const event: Event = {
      message: 'connect redis://user:pw@host failed',
      exception: {
        values: [{ type: 'Error', value: 'auth to redis://u:p@h failed' }],
      },
      breadcrumbs: [{ message: 'using token: abc123' }],
      request: { url: 'redis://user:pw@host/0', query_string: 'password=x' },
    }

    const result = scrubEvent(event)

    expect(result.message).toBe(`connect redis://${REDACTED}@host failed`)
    expect(result.exception!.values![0].value).toBe(
      `auth to redis://${REDACTED}@h failed`,
    )
    expect(result.breadcrumbs?.[0].message).toBe(`using token: ${REDACTED}`)
    expect((result.request as any).url).toBe(`redis://${REDACTED}@host/0`)
    expect((result.request as any).query_string).toBe(`password=${REDACTED}`)
  })

  it('scrubs secrets from frame source context', () => {
    const event: Event = {
      exception: {
        values: [
          {
            type: 'Error',
            value: 'x',
            stacktrace: {
              frames: [
                {
                  filename: '/app/db.js',
                  context_line: "connect('redis://u:pw@h')",
                  pre_context: ['const token = "abc123secret"'],
                },
              ],
            },
          },
        ],
      },
    }

    const frame = scrubEvent(event).exception!.values![0].stacktrace!.frames![0]
    expect(frame.context_line).toBe(`connect('redis://${REDACTED}@h')`)
    expect(frame.pre_context?.[0]).toContain(REDACTED)
  })

  it('redacts secrets in breadcrumb data URLs and normalizes request url', () => {
    const event: Event = {
      breadcrumbs: [
        { data: { url: 'https://api.example.com/x?access_token=abc123' } },
      ],
      request: { url: 'file:///C:/Users/jane/dist/renderer/index.html' },
    }

    const result = scrubEvent(event)

    expect(result.breadcrumbs?.[0].data?.url).toBe(
      `https://api.example.com/x?access_token=${REDACTED}`,
    )
    expect((result.request as any).url).toBe(
      'file:///C:/Users/<user>/dist/renderer/index.html',
    )
  })

  it('clears server_name and the client IP', () => {
    const event: Event = {
      server_name: 'jane-macbook',
      user: { id: 'u1', ip_address: '1.2.3.4' },
    }

    const result = scrubEvent(event)
    expect(result.server_name).toBeUndefined()
    expect(result.user?.ip_address).toBeUndefined()
    expect(result.user?.id).toBe('u1')
  })
})

describe('minimizeEvent', () => {
  const fullEvent: Event = {
    event_id: 'abc',
    release: 'redisinsight@1.0.0',
    environment: 'production',
    message: 'connection to redis://user:pass@host failed',
    exception: {
      values: [
        {
          type: 'DriverError',
          value: 'redis://user:pass@host failed',
          stacktrace: {
            frames: [
              {
                function: 'connect',
                filename: '/Users/jane/app/db.js',
                abs_path: '/Users/jane/app/db.js',
                lineno: 10,
                vars: { password: 'p' } as any,
                context_line: 'const x = secret',
              },
            ],
          },
        },
      ],
    },
    breadcrumbs: [{ data: { url: '/keys' } }],
    request: { url: 'http://localhost/api' },
    extra: { foo: 'bar' },
    contexts: {
      os: { name: 'macOS' } as any,
      runtime: { name: 'node' } as any,
      device: { name: 'jane-macbook' } as any,
    },
    user: { id: 'real-anon-id' },
    debug_meta: {
      images: [
        {
          type: 'sourcemap',
          code_file: 'app:///dist/renderer/assets/index.js',
          debug_id: 'b76225bc-8e92-465c-accc-66d0a79a17da',
        },
        {
          type: 'sourcemap',
          code_file: '/Users/jane/app/main.js',
          debug_id: 'aaaa1111-bbbb-2222-cccc-333344445555',
        },
      ],
    } as any,
  }

  it('keeps only the allowlisted fields', () => {
    const result = minimizeEvent(fullEvent)
    expect(result.release).toBe('redisinsight@1.0.0')
    expect(result.environment).toBe('production')
    expect(result.exception!.values![0].type).toBe('DriverError')
    expect(result.contexts?.os).toEqual({ name: 'macOS' })
    expect(result.contexts?.runtime).toEqual({ name: 'node' })
  })

  it('drops the message, breadcrumbs, request and extra', () => {
    const result = minimizeEvent(fullEvent)
    expect(result.message).toBeUndefined()
    expect(result.breadcrumbs).toBeUndefined()
    expect(result.request).toBeUndefined()
    expect(result.extra).toBeUndefined()
    expect(result.exception!.values![0].value).toBe('')
  })

  it('strips frame locals/source and normalizes paths', () => {
    const frame =
      minimizeEvent(fullEvent).exception!.values![0].stacktrace!.frames![0]
    expect(frame.function).toBe('connect')
    expect(frame.filename).toBe('/Users/<user>/app/db.js')
    expect(frame.abs_path).toBe('/Users/<user>/app/db.js')
    expect((frame as any).vars).toBeUndefined()
    expect(frame.context_line).toBeUndefined()
  })

  it('keeps debug_meta for symbolication and normalizes code_file paths', () => {
    const images = minimizeEvent(fullEvent).debug_meta?.images as any[]
    expect(images).toHaveLength(2)
    expect(images[0].debug_id).toBe('b76225bc-8e92-465c-accc-66d0a79a17da')
    expect(images[0].code_file).toBe('app:///dist/renderer/assets/index.js')
    // a user path in code_file is normalized
    expect(images[1].code_file).toBe('/Users/<user>/app/main.js')
  })

  it('forces the shared anonymous id and drops device context', () => {
    const result = minimizeEvent(fullEvent)
    expect(result.user).toEqual({ id: NON_TRACKING_ANONYMOUS_ID })
    expect(result.contexts?.device).toBeUndefined()
    expect(result.tags?.tier).toBe('anonymous')
  })
})

describe('shouldDropEvent', () => {
  it('drops Monaco editor cancellations (by exception type)', () => {
    expect(shouldDropEvent(errorEvent('', [], 'Canceled'))).toBe(true)
  })

  it('drops errors originating in a browser extension', () => {
    const event = errorEvent('boom', [
      { function: 'g', filename: 'chrome-extension://abcdef/inpage.js' },
    ])
    expect(shouldDropEvent(event)).toBe(true)
  })

  it.each([
    ['afterWriteDispatched', 'stream_base_commons'],
    ['writeSync', 'node:fs'],
    ['TCP.onStreamRead', 'stream_base_commons'],
  ])('drops the Node I/O write storm (%s / %s frame)', (fn, moduleName) => {
    const event = errorEvent('', [{ function: fn, module: moduleName }])
    expect(shouldDropEvent(event)).toBe(true)
  })

  it.each(['EBADF', 'EIO', 'EPIPE', 'ENOSPC'])(
    'drops low-level I/O errors by code (%s), even without a matching frame',
    (code) => {
      expect(shouldDropEvent(errorEvent(`${code}: write failed`))).toBe(true)
    },
  )

  it('drops the Electron GPU abnormal-exit warning', () => {
    const event: Event = {
      message: "'GPU' process exited with 'abnormal-exit'",
    }
    expect(shouldDropEvent(event)).toBe(true)
  })

  it('keeps genuine application errors', () => {
    const event = errorEvent('Cannot read properties of undefined', [
      {
        function: 'render',
        filename: '/app.asar/dist/renderer/KeyTree.tsx',
        module: 'KeyTree',
      },
    ])
    expect(shouldDropEvent(event)).toBe(false)
  })

  it('does not treat an app frame merely named writeSync as I/O noise', () => {
    // `writeSync` in app code (not a Node-internal module) must survive.
    const event = errorEvent('boom', [
      { function: 'writeSync', filename: '/app.asar/dist/main/store.js' },
    ])
    expect(shouldDropEvent(event)).toBe(false)
  })

  it('handles events with no exception or frames', () => {
    expect(shouldDropEvent({})).toBe(false)
    expect(shouldDropEvent({ message: 'plain message' })).toBe(false)
  })
})

describe('applyFingerprint', () => {
  it.each([
    'Failed to open: The system cannot find the file specified. (0x2)',
    'Failed to open: 系统找不到指定的文件。 (0x2)',
    'Failed to open: El sistema no puede encontrar el archivo especificado.',
  ])('collapses the localized "Failed to open" family: %s', (value) => {
    const result = applyFingerprint(errorEvent(value))
    expect(result.fingerprint).toEqual([FAILED_TO_OPEN_FINGERPRINT])
  })

  it('leaves unrelated events on default grouping', () => {
    const result = applyFingerprint(errorEvent('some other error'))
    expect(result.fingerprint).toBeUndefined()
  })

  it('reads grouping signals from sourceEvent when provided', () => {
    // Target has no message (Tier-1 minimized); source still carries it.
    const target = errorEvent('')
    const source = errorEvent('Failed to open: file not found')
    const result = applyFingerprint(target, source)
    expect(result.fingerprint).toEqual([FAILED_TO_OPEN_FINGERPRINT])
  })
})

describe('finalizeSentryEvent', () => {
  it('returns null for dropped noise regardless of consent', () => {
    const noise = errorEvent('', [], 'Canceled')
    expect(finalizeSentryEvent(noise, true)).toBeNull()
    expect(finalizeSentryEvent(noise, false)).toBeNull()
  })

  it('scrubs and keeps the full event when analytics is granted', () => {
    const event: Event = {
      message: 'connect redis://user:pw@host failed',
      exception: { values: [{ type: 'Error', value: 'boom' }] },
    }
    const result = finalizeSentryEvent(event, true)
    expect(result).not.toBeNull()
    expect(result!.message).toBe(`connect redis://${REDACTED}@host failed`)
    expect(result!.exception!.values![0].value).toBe('boom')
  })

  it('minimizes the event when analytics is not granted', () => {
    const event = errorEvent('sensitive detail')
    const result = finalizeSentryEvent(event, false)
    expect(result!.exception!.values![0].value).toBe('')
    expect(result!.user).toEqual({ id: NON_TRACKING_ANONYMOUS_ID })
  })

  it('fingerprints "Failed to open" even for a minimized (Tier-1) event', () => {
    const event = errorEvent('Failed to open: file not found (0x2)')
    const result = finalizeSentryEvent(event, false)
    // Message is blanked by minimize, but fingerprint is read from the original.
    expect(result!.exception!.values![0].value).toBe('')
    expect(result!.fingerprint).toEqual([FAILED_TO_OPEN_FINGERPRINT])
  })
})
