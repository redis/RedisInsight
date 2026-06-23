import { ConnectionType } from 'uiSrc/slices/interfaces'
import { getProductionSignals, looksLikeProduction } from './utils'
import { PRODUCTION_KEY_COUNT_THRESHOLD } from './PromoteProductionPrompt.constants'

describe('getProductionSignals', () => {
  it('flags the key-count signal only above the threshold', () => {
    expect(
      getProductionSignals({ totalKeys: PRODUCTION_KEY_COUNT_THRESHOLD })
        .hasKeyCountSignal,
    ).toBe(false)
    expect(
      getProductionSignals({ totalKeys: PRODUCTION_KEY_COUNT_THRESHOLD + 1 })
        .hasKeyCountSignal,
    ).toBe(true)
    expect(getProductionSignals({ totalKeys: null }).hasKeyCountSignal).toBe(
      false,
    )
    expect(getProductionSignals({}).hasKeyCountSignal).toBe(false)
  })

  it('treats local hosts as non-remote (case-insensitive, trimmed)', () => {
    expect(getProductionSignals({ host: 'localhost' }).isRemoteHost).toBe(false)
    expect(getProductionSignals({ host: '127.0.0.1' }).isRemoteHost).toBe(false)
    expect(getProductionSignals({ host: ' LOCALHOST ' }).isRemoteHost).toBe(
      false,
    )
    expect(
      getProductionSignals({ host: 'redis.prod.example.com' }).isRemoteHost,
    ).toBe(true)
  })

  it('detects tls, clustered topology and auth signals', () => {
    expect(getProductionSignals({ tls: true }).hasTls).toBe(true)
    expect(
      getProductionSignals({ connectionType: ConnectionType.Cluster })
        .isClustered,
    ).toBe(true)
    expect(
      getProductionSignals({ connectionType: ConnectionType.Sentinel })
        .isClustered,
    ).toBe(true)
    expect(
      getProductionSignals({ connectionType: ConnectionType.Standalone })
        .isClustered,
    ).toBe(false)
    expect(getProductionSignals({ username: 'default' }).hasAuth).toBe(true)
    expect(getProductionSignals({ username: null }).hasAuth).toBe(false)
  })
})

describe('looksLikeProduction', () => {
  const bigDb = { totalKeys: PRODUCTION_KEY_COUNT_THRESHOLD + 1 }

  it('requires the key-count signal', () => {
    // Plenty of connection signals, but too few keys.
    expect(
      looksLikeProduction(
        getProductionSignals({
          totalKeys: 1,
          host: 'redis.prod.example.com',
          tls: true,
        }),
      ),
    ).toBe(false)
  })

  it('requires at least one connection signal alongside the key count', () => {
    // Large local database with no other production signals (e.g. dev DB
    // loaded with sample data) should NOT trigger.
    expect(
      looksLikeProduction(
        getProductionSignals({
          ...bigDb,
          host: 'localhost',
          tls: false,
          connectionType: ConnectionType.Standalone,
          username: null,
        }),
      ),
    ).toBe(false)
  })

  it.each([
    ['remote host', { host: 'redis.prod.example.com' }],
    ['tls', { tls: true }],
    ['cluster', { connectionType: ConnectionType.Cluster }],
    ['auth', { username: 'default' }],
  ])('matches when key count is high and %s is present', (_label, extra) => {
    expect(
      looksLikeProduction(getProductionSignals({ ...bigDb, ...extra })),
    ).toBe(true)
  })
})
