import { renderHook } from 'uiSrc/utils/test-utils'
import {
  connectedInstanceInfoSelector,
  connectedInstanceSelector,
} from 'uiSrc/slices/instances/instances'
import { useRedisInstanceCompatibility } from './useRedisInstanceCompatibility'
import { UseRedisInstanceCompatibilityReturn } from './useRedisInstanceCompatibility.types'

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn(),
  connectedInstanceInfoSelector: jest.fn(),
}))

jest.mock('uiSrc/slices/interfaces', () => ({
  REDISEARCH_MODULES: ['search', 'searchlight', 'ft'],
}))

const renderUseRedisInstanceCompatibility = () => {
  const { result } = renderHook(() => useRedisInstanceCompatibility())
  return result.current as UseRedisInstanceCompatibilityReturn
}

describe('useRedisInstanceCompatibility', () => {
  const mockConnectedInstanceSelector = connectedInstanceSelector as jest.Mock
  const mockConnectedInstanceInfoSelector =
    connectedInstanceInfoSelector as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockConnectedInstanceInfoSelector.mockReturnValue({
      version: '7.2.0',
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('returns undefineds when loading is undefined (not initialized yet)', () => {
    mockConnectedInstanceSelector.mockReturnValue({
      loading: undefined,
      modules: [{ name: 'search', semanticVersion: '2.6.0' }],
    })

    const hookResult = renderUseRedisInstanceCompatibility()
    expect(hookResult.loading).toBeUndefined()
    expect(hookResult.hasRedisearch).toBeUndefined()
    expect(hookResult.hasMinimumRedisearchVersion).toBeUndefined()
    expect(hookResult.hasSupportedVersion).toBeUndefined()
  })

  it('still returns hasRedisearch=undefined when modules is null even after init', () => {
    mockConnectedInstanceSelector.mockReturnValue({
      loading: false,
      modules: null,
    })

    const hookResult = renderUseRedisInstanceCompatibility()
    expect(hookResult.loading).toBe(false)
    expect(hookResult.hasRedisearch).toBeUndefined()
    expect(hookResult.hasMinimumRedisearchVersion).toBeUndefined()
    expect(hookResult.hasSupportedVersion).toBe(true)
  })

  it('returns loading=true when connectedInstanceSelector returns loading=true', () => {
    mockConnectedInstanceSelector.mockReturnValue({
      loading: true,
      modules: null,
    })

    mockConnectedInstanceInfoSelector.mockReturnValue({})

    const hookResult = renderUseRedisInstanceCompatibility()

    expect(hookResult.loading).toBe(true)
    expect(hookResult.hasRedisearch).toBeUndefined()
    expect(hookResult.hasMinimumRedisearchVersion).toBeUndefined()
    expect(hookResult.hasSupportedVersion).toBeUndefined()
  })

  it('detects RediSearch module + supported version', () => {
    mockConnectedInstanceSelector.mockReturnValue({
      loading: false,
      modules: [
        { name: 'search', semanticVersion: '2.6.0' },
        { name: 'other' },
      ],
    })

    const hookResult = renderUseRedisInstanceCompatibility()

    expect(hookResult.loading).toBe(false)
    expect(hookResult.hasRedisearch).toBe(true)
    expect(hookResult.hasMinimumRedisearchVersion).toBe(true)
    expect(hookResult.hasSupportedVersion).toBe(true)
  })

  it('returns hasRedisearch=false when modules is an empty array (defaulted)', () => {
    mockConnectedInstanceSelector.mockReturnValue({
      loading: false,
    })

    const hookResult = renderUseRedisInstanceCompatibility()
    expect(hookResult.loading).toBe(false)
    expect(hookResult.hasRedisearch).toBe(false)
    expect(hookResult.hasMinimumRedisearchVersion).toBeUndefined()
    expect(hookResult.hasSupportedVersion).toBe(true)
  })

  it('returns hasRedisearch=undefined when modules are missing', () => {
    mockConnectedInstanceSelector.mockReturnValue({
      loading: false,
      modules: null,
    })

    const hookResult = renderUseRedisInstanceCompatibility()
    expect(hookResult.hasRedisearch).toBeUndefined()
    expect(hookResult.hasMinimumRedisearchVersion).toBeUndefined()
    expect(hookResult.hasSupportedVersion).toBe(true)
  })

  it('handles unsupported Redis version (below 7.2) with RediSearch 2.x', () => {
    mockConnectedInstanceSelector.mockReturnValue({
      loading: false,
      modules: [{ name: 'search', semanticVersion: '2.4.0' }],
    })

    mockConnectedInstanceInfoSelector.mockReturnValue({
      version: '7.1.9',
    })

    const hookResult = renderUseRedisInstanceCompatibility()
    expect(hookResult.hasRedisearch).toBe(true)
    expect(hookResult.hasMinimumRedisearchVersion).toBe(true)
    expect(hookResult.hasSupportedVersion).toBe(false)
  })

  it('returns hasMinimumRedisearchVersion=false for RediSearch < 2.0', () => {
    mockConnectedInstanceSelector.mockReturnValue({
      loading: false,
      modules: [{ name: 'search', semanticVersion: '1.6.14' }],
    })

    mockConnectedInstanceInfoSelector.mockReturnValue({
      version: '5.0.14',
    })

    const hookResult = renderUseRedisInstanceCompatibility()
    expect(hookResult.hasRedisearch).toBe(true)
    expect(hookResult.hasMinimumRedisearchVersion).toBe(false)
    expect(hookResult.hasSupportedVersion).toBe(false)
  })

  it('returns hasMinimumRedisearchVersion=true for RediSearch 2.0.0', () => {
    mockConnectedInstanceSelector.mockReturnValue({
      loading: false,
      modules: [{ name: 'search', semanticVersion: '2.0.0' }],
    })

    mockConnectedInstanceInfoSelector.mockReturnValue({
      version: '6.0.0',
    })

    const hookResult = renderUseRedisInstanceCompatibility()
    expect(hookResult.hasMinimumRedisearchVersion).toBe(true)
    expect(hookResult.hasSupportedVersion).toBe(false)
  })

  it('returns hasMinimumRedisearchVersion=true for RediSearch 2.6.3', () => {
    mockConnectedInstanceSelector.mockReturnValue({
      loading: false,
      modules: [{ name: 'search', semanticVersion: '2.6.3' }],
    })

    const hookResult = renderUseRedisInstanceCompatibility()
    expect(hookResult.hasMinimumRedisearchVersion).toBe(true)
    expect(hookResult.hasSupportedVersion).toBe(true)
  })

  it('returns hasMinimumRedisearchVersion=undefined when no RediSearch module present', () => {
    mockConnectedInstanceSelector.mockReturnValue({
      loading: false,
      modules: [{ name: 'ReJSON', semanticVersion: '2.4.0' }],
    })

    const hookResult = renderUseRedisInstanceCompatibility()
    expect(hookResult.hasRedisearch).toBe(false)
    expect(hookResult.hasMinimumRedisearchVersion).toBeUndefined()
  })

  it('falls back to integer version when semanticVersion is missing', () => {
    mockConnectedInstanceSelector.mockReturnValue({
      loading: false,
      modules: [{ name: 'search', version: 20600 }],
    })

    const hookResult = renderUseRedisInstanceCompatibility()
    expect(hookResult.hasRedisearch).toBe(true)
    expect(hookResult.hasMinimumRedisearchVersion).toBe(true)
  })

  it('handles unparsable Redis version -> false for hasSupportedVersion', () => {
    mockConnectedInstanceSelector.mockReturnValue({
      loading: false,
      modules: [{ name: 'something else' }],
    })

    mockConnectedInstanceInfoSelector.mockReturnValue({
      version: 'not a version',
    })

    const hookResult = renderUseRedisInstanceCompatibility()
    expect(hookResult.hasMinimumRedisearchVersion).toBeUndefined()
    expect(hookResult.hasSupportedVersion).toBe(false)
  })

  it('handles absent Redis version -> undefined for hasSupportedVersion', () => {
    mockConnectedInstanceSelector.mockReturnValue({
      loading: false,
      modules: [{ name: 'search', semanticVersion: '2.6.0' }],
    })

    mockConnectedInstanceInfoSelector.mockReturnValue({
      version: undefined,
    })

    const hookResult = renderUseRedisInstanceCompatibility()
    expect(hookResult.hasMinimumRedisearchVersion).toBe(true)
    expect(hookResult.hasSupportedVersion).toBeUndefined()
  })
})
