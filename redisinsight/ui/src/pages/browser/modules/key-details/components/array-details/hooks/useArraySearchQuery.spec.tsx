import { cloneDeep } from 'lodash'
import {
  act,
  initialStateDefault,
  mockStore,
  renderHook,
} from 'uiSrc/utils/test-utils'
import { apiService } from 'uiSrc/services'
import { KeyTypes } from 'uiSrc/constants'
import { stringToBuffer } from 'uiSrc/utils'
import { initialState as initialStateArray } from 'uiSrc/slices/browser/array'
import {
  ArrayCombinator,
  ArrayGrepCriteria,
} from 'uiSrc/slices/interfaces/array'
import { useArraySearchQuery } from './useArraySearchQuery'

const KEY = 'readings'
const keyBuffer = stringToBuffer(KEY)
const otherKeyBuffer = stringToBuffer('other')

const buildState = (
  overrides: {
    selectedKeyType?: KeyTypes
    selectedKeyName?: ReturnType<typeof stringToBuffer> | null
  } = {},
) => {
  const next = cloneDeep(initialStateDefault)
  next.browser.array = cloneDeep(initialStateArray)
  next.browser.keys.selectedKey.data = overrides.selectedKeyName
    ? ({
        type: overrides.selectedKeyType ?? KeyTypes.Array,
        name: overrides.selectedKeyName,
      } as any)
    : null
  return next
}

const renderWithStore = (
  prop: ReturnType<typeof stringToBuffer> | null,
  state = buildState({ selectedKeyName: keyBuffer }),
) => {
  const store = mockStore(state)
  store.clearActions()
  const view = renderHook((p) => useArraySearchQuery(p as typeof prop), {
    store,
    initialProps: prop,
  } as any)
  return { ...view, store }
}

const searchBody = () =>
  (apiService.post as jest.Mock).mock.calls.find(([url]) =>
    url.includes('array/search'),
  )?.[1]

describe('useArraySearchQuery', () => {
  beforeEach(() => {
    apiService.post = jest
      .fn()
      .mockResolvedValue({ status: 200, data: { keyName: KEY, elements: [] } })
  })

  it('initialises one predicate, the default connective, and default options', () => {
    const { result } = renderWithStore(keyBuffer)

    expect(result.current.predicates).toEqual([
      { criteria: ArrayGrepCriteria.Exact, value: '' },
    ])
    expect(result.current.combinator).toBe(ArrayCombinator.Or)
    expect(result.current.options).toEqual({
      start: '',
      end: '',
      nocase: false,
      withValues: true,
      limitEnabled: false,
      limit: '10',
    })
    expect(result.current.isArrayKeyReady).toBe(true)
  })

  it('isArrayKeyReady=false until selectedKeyData catches up / for a non-array key', () => {
    expect(
      renderWithStore(keyBuffer, buildState({ selectedKeyName: null })).result
        .current.isArrayKeyReady,
    ).toBe(false)
    expect(
      renderWithStore(
        keyBuffer,
        buildState({
          selectedKeyName: keyBuffer,
          selectedKeyType: KeyTypes.String,
        }),
      ).result.current.isArrayKeyReady,
    ).toBe(false)
  })

  it('adds, updates, and removes predicate rows (never below one)', () => {
    const { result } = renderWithStore(keyBuffer)

    act(() => result.current.addPredicate())
    act(() =>
      result.current.updatePredicate(1, {
        criteria: ArrayGrepCriteria.Glob,
        value: 'a*',
      }),
    )
    expect(result.current.predicates).toEqual([
      { criteria: ArrayGrepCriteria.Exact, value: '' },
      { criteria: ArrayGrepCriteria.Glob, value: 'a*' },
    ])

    act(() => result.current.removePredicate(0))
    expect(result.current.predicates).toEqual([
      { criteria: ArrayGrepCriteria.Glob, value: 'a*' },
    ])

    // The last row can't be removed.
    act(() => result.current.removePredicate(0))
    expect(result.current.predicates).toHaveLength(1)
  })

  it('does not auto-fire a search on first render (search is user-initiated)', () => {
    renderWithStore(keyBuffer)

    expect(searchBody()).toBeUndefined()
  })

  it('runSearch posts a single predicate uncapped when LIMIT is off', async () => {
    const { result } = renderWithStore(keyBuffer)

    act(() => result.current.updatePredicate(0, { value: 'redis' }))
    await act(async () => {
      result.current.runSearch()
    })

    // One predicate → no connective; default options omitted; no LIMIT sent,
    // so the search is uncapped.
    expect(searchBody()).toEqual({
      keyName: keyBuffer,
      predicates: [{ criteria: ArrayGrepCriteria.Exact, value: 'redis' }],
    })
  })

  it('runSearch posts all predicates + the global connective + options', async () => {
    const { result } = renderWithStore(keyBuffer)

    act(() => {
      result.current.updatePredicate(0, {
        criteria: ArrayGrepCriteria.Glob,
        value: 'a*',
      })
      result.current.addPredicate()
      result.current.updatePredicate(1, {
        criteria: ArrayGrepCriteria.Re,
        value: '^b',
      })
      result.current.setCombinator(ArrayCombinator.And)
      result.current.updateOptions({
        start: '0',
        end: '99',
        nocase: true,
        withValues: false,
        limitEnabled: true,
        limit: '25',
      })
    })
    await act(async () => {
      result.current.runSearch()
    })

    expect(searchBody()).toEqual({
      keyName: keyBuffer,
      predicates: [
        { criteria: ArrayGrepCriteria.Glob, value: 'a*' },
        { criteria: ArrayGrepCriteria.Re, value: '^b' },
      ],
      combinator: ArrayCombinator.And,
      start: '0',
      end: '99',
      nocase: true,
      withValues: false,
      limit: 25,
    })
  })

  it('runSearch is a no-op while isArrayKeyReady=false', async () => {
    const { result } = renderWithStore(
      keyBuffer,
      buildState({ selectedKeyName: null }),
    )

    await act(async () => {
      result.current.runSearch()
    })

    expect(searchBody()).toBeUndefined()
  })

  it('resets predicates, connective, and options when the selected key changes', () => {
    const { result, rerender } = renderWithStore(keyBuffer)

    act(() => {
      result.current.addPredicate()
      result.current.setCombinator(ArrayCombinator.And)
      result.current.updateOptions({ nocase: true, limitEnabled: true })
    })
    expect(result.current.predicates).toHaveLength(2)

    act(() => {
      rerender(otherKeyBuffer)
    })

    expect(result.current.predicates).toEqual([
      { criteria: ArrayGrepCriteria.Exact, value: '' },
    ])
    expect(result.current.combinator).toBe(ArrayCombinator.Or)
    expect(result.current.options.nocase).toBe(false)
    expect(result.current.options.limitEnabled).toBe(false)
  })

  it('resetQuery restores defaults without a key change', () => {
    const { result } = renderWithStore(keyBuffer)

    act(() => {
      result.current.addPredicate()
      result.current.setCombinator(ArrayCombinator.And)
      result.current.updateOptions({ nocase: true, limitEnabled: true })
    })
    expect(result.current.predicates).toHaveLength(2)

    act(() => result.current.resetQuery())

    expect(result.current.predicates).toEqual([
      { criteria: ArrayGrepCriteria.Exact, value: '' },
    ])
    expect(result.current.combinator).toBe(ArrayCombinator.Or)
    expect(result.current.options.nocase).toBe(false)
    expect(result.current.options.limitEnabled).toBe(false)
  })
})
