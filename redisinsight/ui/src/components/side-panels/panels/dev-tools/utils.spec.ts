import { faker } from '@faker-js/faker'

import { ConnectionProvider, ConnectionType } from 'uiSrc/slices/interfaces'

import { DEV_TOOLS_INIT_COMMAND } from './DevTools.constants'
import { InitTargetKind } from './DevTools.types'
import { buildInitCommand, buildRadarUrl, resolveInitTarget } from './utils'

describe('resolveInitTarget', () => {
  const name = 'orders-dev'
  const standalone = {
    name,
    host: 'localhost',
    port: 6379,
    provider: ConnectionProvider.LOCALHOST,
    connectionType: ConnectionType.Standalone,
  }

  it('should return a cloud target for a Redis Cloud database', () => {
    expect(
      resolveInitTarget({
        ...standalone,
        provider: ConnectionProvider.REDIS_CLOUD,
      }),
    ).toEqual({ kind: InitTargetKind.Cloud, name })
  })

  it('should return a url target for a standalone database', () => {
    expect(resolveInitTarget(standalone)).toEqual({
      kind: InitTargetKind.Url,
      name,
      url: 'redis://localhost:6379',
    })
  })

  it('should use the rediss scheme and username without a password', () => {
    expect(
      resolveInitTarget({ ...standalone, tls: true, username: 'default' }),
    ).toMatchObject({ url: 'rediss://default@localhost:6379' })
  })

  it('should never put a password in the url', () => {
    expect(
      resolveInitTarget({ ...standalone, password: true as never }),
    ).toEqual({
      kind: InitTargetKind.Url,
      name,
      url: 'redis://localhost:6379',
    })
  })

  it('should append a non-zero db index', () => {
    expect(resolveInitTarget({ ...standalone, db: 3 })).toMatchObject({
      url: 'redis://localhost:6379/3',
    })
    expect(resolveInitTarget({ ...standalone, db: 0 })).toMatchObject({
      url: 'redis://localhost:6379',
    })
  })

  it('should wrap an IPv6 host in brackets', () => {
    expect(resolveInitTarget({ ...standalone, host: '::1' })).toMatchObject({
      url: 'redis://[::1]:6379',
    })
  })

  it.each([
    ['cluster', { connectionType: ConnectionType.Cluster }],
    ['sentinel', { connectionType: ConnectionType.Sentinel }],
    ['ssh tunnel', { ssh: true }],
    ['client certificate', { tlsClientAuthRequired: true }],
    ['custom ca certificate', { tls: true, caCert: { id: 'ca', name: 'ca' } }],
    ['missing host', { host: '' }],
    ['missing name', { name: '' }],
  ])('should return null for %s', (_label, overrides) => {
    expect(resolveInitTarget({ ...standalone, ...overrides })).toBeNull()
  })
})

describe('buildInitCommand', () => {
  it('should return the plain init command without a target', () => {
    expect(buildInitCommand()).toBe(DEV_TOOLS_INIT_COMMAND)
    expect(buildInitCommand(null)).toBe(DEV_TOOLS_INIT_COMMAND)
  })

  it('should append the cloud flags for a cloud target', () => {
    expect(
      buildInitCommand({ kind: InitTargetKind.Cloud, name: 'orders-dev' }),
    ).toBe(`${DEV_TOOLS_INIT_COMMAND} --cloud --name orders-dev`)
  })

  it('should append the url flags for a url target', () => {
    expect(
      buildInitCommand({
        kind: InitTargetKind.Url,
        name: 'local',
        url: 'redis://localhost:6379',
      }),
    ).toBe(
      `${DEV_TOOLS_INIT_COMMAND} --url redis://localhost:6379 --name local`,
    )
  })

  it('should quote a database name that is not shell safe', () => {
    const name = `${faker.word.noun()} ${faker.word.noun()}`

    expect(buildInitCommand({ kind: InitTargetKind.Cloud, name })).toBe(
      `${DEV_TOOLS_INIT_COMMAND} --cloud --name '${name}'`,
    )
  })

  it('should escape single quotes in the database name', () => {
    expect(buildInitCommand({ kind: InitTargetKind.Cloud, name: "it's" })).toBe(
      `${DEV_TOOLS_INIT_COMMAND} --cloud --name 'it'\\''s'`,
    )
  })

  it('should quote a url that contains shell metacharacters', () => {
    expect(
      buildInitCommand({
        kind: InitTargetKind.Url,
        name: 'local',
        url: 'redis://[::1]:6379',
      }),
    ).toContain("--url 'redis://[::1]:6379'")
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
