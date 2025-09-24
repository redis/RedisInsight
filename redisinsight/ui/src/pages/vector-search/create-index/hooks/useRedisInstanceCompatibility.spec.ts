import { renderHook } from 'uiSrc/utils/test-utils'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import useRedisInstanceCompatibility, {
  UseRedisInstanceCompatibilityReturn,
} from './useRedisInstanceCompatibility'

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn(),
}))

jest.mock('uiSrc/slices/interfaces', () => ({
  REDISEARCH_MODULES: ['search', 'RediSearch'],
}))

const renderUseRedisInstanceCompatibility = () => {
  const { result } = renderHook(() => useRedisInstanceCompatibility())
  return result.current as UseRedisInstanceCompatibilityReturn
}

describe('useRedisInstanceCompatibility', () => {
  const mockConnectedInstanceSelector = connectedInstanceSelector as jest.Mock

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('returns undefineds when loading is undefined (not initialized yet)', () => {
    mockConnectedInstanceSelector.mockReturnValue({
      loading: undefined,
      modules: [{ name: 'search' }],
      version: '7.2.0',
    })

    const hookResult = renderUseRedisInstanceCompatibility()
    expect(hookResult.loading).toBeUndefined()
    expect(hookResult.hasRedisearch).toBeUndefined()
    expect(hookResult.hasSupportedVersion).toBeUndefined()
  })

  it('still returns hasRedisearch=undefined when modules is null even after init', () => {
    mockConnectedInstanceSelector.mockReturnValue({
      loading: false,
      modules: null,
      version: '7.2.0',
    })

    const hookResult = renderUseRedisInstanceCompatibility()
    expect(hookResult.loading).toBe(false)
    // preserve prior behavior: null => unknown, not false
    expect(hookResult.hasRedisearch).toBeUndefined()
    expect(hookResult.hasSupportedVersion).toBe(true)
  })

  it('returns loading=true when connectedInstanceSelector returns loading=true', () => {
    mockConnectedInstanceSelector.mockReturnValue({
      loading: true,
      modules: null,
    })

    const hookResult = renderUseRedisInstanceCompatibility()

    expect(hookResult.loading).toBe(true)
    expect(hookResult.hasRedisearch).toBeUndefined()
    expect(hookResult.hasSupportedVersion).toBeUndefined()
  })

  it('detects RediSearch module + supported version', () => {
    mockConnectedInstanceSelector.mockReturnValue({
      loading: false,
      modules: [{ name: 'search' }, { name: 'other' }],
      version: '7.2.0',
    })

    const hookResult = renderUseRedisInstanceCompatibility()

    expect(hookResult.loading).toBe(false)
    expect(hookResult.hasRedisearch).toBe(true)
    expect(hookResult.hasSupportedVersion).toBe(true)
  })

  it('returns hasRedisearch=false when modules is an empty array (defaulted)', () => {
    mockConnectedInstanceSelector.mockReturnValue({
      loading: false,
      version: '7.2.0',
      // omit `modules` to hit the default `modules = []`
    })

    const hookResult = renderUseRedisInstanceCompatibility()
    expect(hookResult.loading).toBe(false)
    expect(hookResult.hasRedisearch).toBe(false)
    expect(hookResult.hasSupportedVersion).toBe(true)
  })

  it('returns hasRedisearch=undefined when modules are missing', () => {
    mockConnectedInstanceSelector.mockReturnValue({
      loading: false,
      modules: null, // explicit null
      version: '7.2.0',
    })

    const hookResult = renderUseRedisInstanceCompatibility()
    expect(hookResult.hasRedisearch).toBeUndefined()
    expect(hookResult.hasSupportedVersion).toBe(true)
  })

  it('handles unsupported version', () => {
    mockConnectedInstanceSelector.mockReturnValue({
      loading: false,
      modules: [{ name: 'RediSearch' }],
      version: '7.1.9',
    })

    const hookResult = renderUseRedisInstanceCompatibility()
    expect(hookResult.hasRedisearch).toBe(true)
    expect(hookResult.hasSupportedVersion).toBe(false)
  })

  it('handles unparsable version -> false', () => {
    mockConnectedInstanceSelector.mockReturnValue({
      loading: false,
      modules: [{ name: 'something else' }],
      version: 'not a version',
    })

    const hookResult = renderUseRedisInstanceCompatibility()
    expect(hookResult.hasSupportedVersion).toBe(false)
  })

  it('handles absent version -> undefined', () => {
    mockConnectedInstanceSelector.mockReturnValue({
      loading: false,
      modules: [{ name: 'search' }],
      version: undefined,
    })

    const hookResult = renderUseRedisInstanceCompatibility()
    expect(hookResult.hasSupportedVersion).toBeUndefined()
  })
})
