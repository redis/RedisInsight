import { renderHook } from 'uiSrc/utils/test-utils'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import useRedisInstanceCompatibility, {
  isVersionSupported,
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

  test.each([
    [undefined, false],
    [null, false],
    ['', false],
    ['7.1.9', false],
    ['7.2', true],
    ['v7.2', true],
    ['7.2.0', true],
    ['7.2.0+build.5', true],
    ['7.2.0-rc.1', false], // prerelease should NOT satisfy >=7.2.0
    ['Redis 7.2-rc1 (abc)', true], // coerced to 7.2.0 -> true (note: prerelease info lost)
    ['Redis 6 something', false],
    ['nonsense', false],
  ])('isVersionSupported(%p) === %p', (input, expected) => {
    expect(isVersionSupported(input as any)).toBe(expected)
  })

  it('returns loading=true when connectedInstanceSelector returns loading=true', () => {
    mockConnectedInstanceSelector.mockReturnValue({
      loading: true,
      modules: null,
    })

    const hookResult = renderUseRedisInstanceCompatibility()

    expect(hookResult.loading).toBe(true)
    expect(hookResult.hasRedisearch).toBeUndefined()
    expect(hookResult.hasSupportedVersion).toBe(false)
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

  it('handles unparsable/absent version -> false', () => {
    mockConnectedInstanceSelector.mockReturnValue({
      loading: false,
      modules: [{ name: 'something else' }],
      version: 'not a version',
    })

    const hookResult1 = renderUseRedisInstanceCompatibility()
    expect(hookResult1.hasSupportedVersion).toBe(false)

    mockConnectedInstanceSelector.mockReturnValue({
      loading: false,
      modules: [{ name: 'search' }],
      version: undefined,
    })

    const hookResult2 = renderUseRedisInstanceCompatibility()
    expect(hookResult2.hasSupportedVersion).toBe(false)
  })
})
