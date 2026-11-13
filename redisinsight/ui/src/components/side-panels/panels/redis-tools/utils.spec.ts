import { faker } from '@faker-js/faker'

import { ConnectionProvider, ConnectionType } from 'uiSrc/slices/interfaces'
import { Instance } from 'uiSrc/slices/interfaces/instances'

import { REDIS_TOOLS_INIT_COMMAND } from './RedisTools.constants'
import { InitTargetKind } from './RedisTools.types'
import {
  buildConnectionUrl,
  buildInitCommand,
  buildRadarUrl,
  resolveInitTarget,
} from './utils'

describe('resolveInitTarget', () => {
  const name = 'orders-dev'
  const standalone = {
    name,
    host: 'localhost',
    port: 6379,
    provider: ConnectionProvider.LOCALHOST,
    connectionType: ConnectionType.Standalone,
  }

  // The generated provider type is a strict enum; tests only need the strings.
  const azureProvider = (authType: string): Partial<Instance> =>
    ({ providerDetails: { provider: 'azure', authType } }) as never

  it('should return a cloud target for a Redis Cloud database', () => {
    expect(
      resolveInitTarget({
        ...standalone,
        provider: ConnectionProvider.REDIS_CLOUD,
      }),
    ).toEqual({ kind: InitTargetKind.Cloud, name })
  })

  it('should return a url connection for a standalone database', () => {
    expect(resolveInitTarget(standalone)).toEqual({
      kind: InitTargetKind.Url,
      name,
      connection: {
        host: 'localhost',
        port: 6379,
        tls: false,
        username: undefined,
        db: undefined,
        hasPassword: false,
      },
    })
  })

  it('should use the provider database name for a Redis Cloud database', () => {
    expect(
      resolveInitTarget({
        ...standalone,
        provider: ConnectionProvider.REDIS_CLOUD,
        nameFromProvider: 'cloud-db-1',
      }),
    ).toEqual({ kind: InitTargetKind.Cloud, name: 'cloud-db-1' })
  })

  it('should keep a tls database that verifies the server certificate', () => {
    expect(
      resolveInitTarget({ ...standalone, tls: true, verifyServerCert: true }),
    ).toMatchObject({ connection: { tls: true } })
  })

  it('should flag a password without reading it', () => {
    const target = resolveInitTarget({
      ...standalone,
      tls: true,
      verifyServerCert: true,
      username: 'app',
      db: 3,
      password: true as never,
    })

    expect(target).toMatchObject({
      connection: { tls: true, username: 'app', db: 3, hasPassword: true },
    })
    expect(JSON.stringify(target)).not.toContain('"password"')
  })

  it('should keep an azure database that uses access keys', () => {
    expect(
      resolveInitTarget({
        ...standalone,
        ...azureProvider('accessKey'),
      }),
    ).toMatchObject({ kind: InitTargetKind.Url })
  })

  it.each([
    ['cluster', { connectionType: ConnectionType.Cluster }],
    ['sentinel', { connectionType: ConnectionType.Sentinel }],
    ['ssh tunnel', { ssh: true }],
    ['client certificate', { tlsClientAuthRequired: true }],
    [
      'custom ca certificate',
      { tls: true, verifyServerCert: true, caCert: { id: 'ca', name: 'ca' } },
    ],
    [
      'tls without certificate verification',
      { tls: true, verifyServerCert: false },
    ],
    [
      'custom tls server name',
      { tls: true, verifyServerCert: true, tlsServername: 'redis.internal' },
    ],
    ['azure entra id', azureProvider('entraId')],
    ['missing host', { host: '' }],
    ['missing name', { name: '' }],
  ])('should return null for %s', (_label, overrides) => {
    expect(resolveInitTarget({ ...standalone, ...overrides })).toBeNull()
  })
})

describe('buildConnectionUrl', () => {
  const connection = {
    host: 'localhost',
    port: 6379,
    tls: false,
    hasPassword: false,
  }

  it('should omit credentials without a password or username', () => {
    expect(buildConnectionUrl(connection)).toBe('redis://localhost:6379')
  })

  it('should use the rediss scheme and a username without a password', () => {
    expect(
      buildConnectionUrl({ ...connection, tls: true, username: 'app' }),
    ).toBe('rediss://app@localhost:6379')
  })

  it('should default the username when a password is set', () => {
    expect(buildConnectionUrl(connection, 'secret')).toBe(
      'redis://default:secret@localhost:6379',
    )
  })

  it('should encode special characters in the password', () => {
    expect(buildConnectionUrl(connection, 'p@ss/w:rd')).toBe(
      'redis://default:p%40ss%2Fw%3Ard@localhost:6379',
    )
  })

  it('should append a non-zero db index', () => {
    expect(buildConnectionUrl({ ...connection, db: 3 })).toBe(
      'redis://localhost:6379/3',
    )
    expect(buildConnectionUrl({ ...connection, db: 0 })).toBe(
      'redis://localhost:6379',
    )
  })

  it('should wrap an IPv6 host in brackets', () => {
    expect(buildConnectionUrl({ ...connection, host: '::1' })).toBe(
      'redis://[::1]:6379',
    )
  })
})

describe('buildInitCommand', () => {
  const urlTarget = (hasPassword: boolean) => ({
    kind: InitTargetKind.Url as const,
    name: 'local',
    connection: { host: '127.0.0.1', port: 6379, tls: false, hasPassword },
  })

  it('should return the plain init command without a target', () => {
    expect(buildInitCommand()).toBe(REDIS_TOOLS_INIT_COMMAND)
    expect(buildInitCommand(null)).toBe(REDIS_TOOLS_INIT_COMMAND)
  })

  it('should append the cloud flags for a cloud target', () => {
    expect(
      buildInitCommand({ kind: InitTargetKind.Cloud, name: 'orders-dev' }),
    ).toBe(`${REDIS_TOOLS_INIT_COMMAND} --cloud --name orders-dev`)
  })

  it('should append a quoted url without credentials when there is no password', () => {
    expect(buildInitCommand(urlTarget(false), 'ignored')).toBe(
      `${REDIS_TOOLS_INIT_COMMAND} --url 'redis://127.0.0.1:6379' --name local`,
    )
  })

  it('should put the password in the url when the database has one', () => {
    expect(buildInitCommand(urlTarget(true), 'secret')).toBe(
      `${REDIS_TOOLS_INIT_COMMAND} --url 'redis://default:secret@127.0.0.1:6379' --name local`,
    )
  })

  it('should quote a database name that is not shell safe', () => {
    const name = `${faker.word.noun()} ${faker.word.noun()}`

    expect(buildInitCommand({ kind: InitTargetKind.Cloud, name })).toBe(
      `${REDIS_TOOLS_INIT_COMMAND} --cloud --name '${name}'`,
    )
  })

  it('should escape single quotes in the database name', () => {
    expect(buildInitCommand({ kind: InitTargetKind.Cloud, name: "it's" })).toBe(
      `${REDIS_TOOLS_INIT_COMMAND} --cloud --name 'it'\\''s'`,
    )
  })

  it('should escape single quotes in the password', () => {
    expect(buildInitCommand(urlTarget(true), "it's")).toContain(
      "'redis://default:it'\\''s@127.0.0.1:6379'",
    )
  })
})

describe('buildRadarUrl', () => {
  it('should include the redisinsight utm parameters', () => {
    const params = new URL(buildRadarUrl()).searchParams

    expect(params.get('utm_source')).toBe('redis')
    expect(params.get('utm_medium')).toBe('app')
    expect(params.get('utm_campaign')).toBe('redisinsight')
  })
})
