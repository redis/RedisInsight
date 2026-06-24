import { useCallback, useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
import {
  abortArraySearch,
  arraySearchSelector,
  resetArraySearch,
  searchArray,
} from 'uiSrc/slices/browser/array'
import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import { isEqualBuffers } from 'uiSrc/utils'
import { KeyTypes } from 'uiSrc/constants'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import {
  ArrayCombinator,
  ArrayGrepPredicate,
  ArraySearchOptions,
} from 'uiSrc/slices/interfaces/array'
import {
  DEFAULT_SEARCH_COMBINATOR,
  DEFAULT_SEARCH_CRITERIA,
  DEFAULT_SEARCH_OPTIONS,
} from '../constants'

const newPredicate = (): ArrayGrepPredicate => ({
  criteria: DEFAULT_SEARCH_CRITERIA,
  value: '',
})

/**
 * Owns the Search tab's ARGREP form state: the predicate rows, the single
 * global AND/OR connective applied across all of them, and the options
 * (range / NOCASE / WITHVALUES / LIMIT). Dispatches `searchArray` on demand.
 *
 * Unlike the View tab, search is user-initiated: nothing fires on key
 * switch. Switching keys instead resets the form and clears the previous
 * key's results so the tab never shows stale matches.
 *
 * Takes the raw `keyProp` buffer (threaded through `KeyDetails` →
 * `DynamicTypeDetails`) rather than reading `selectedKeyData?.name` — the
 * selector lags selection by one `fetchKeyInfo` round-trip.
 */
export const useArraySearchQuery = (keyProp: RedisResponseBuffer | null) => {
  const dispatch = useAppDispatch()
  const { loading, error, loaded, data } = useAppSelector(arraySearchSelector)
  const selectedKeyData = useAppSelector(selectedKeyDataSelector)

  const [predicates, setPredicates] = useState<ArrayGrepPredicate[]>([
    newPredicate(),
  ])
  const [combinator, setCombinator] = useState<ArrayCombinator>(
    DEFAULT_SEARCH_COMBINATOR,
  )
  const [options, setOptions] = useState<ArraySearchOptions>(
    DEFAULT_SEARCH_OPTIONS,
  )

  // Gated exactly like the View tab so a quick click during a key switch
  // can't fire ARGREP against a non-array key (which the API rejects with
  // WrongType).
  const isArrayKeyReady =
    !!keyProp &&
    selectedKeyData?.type === KeyTypes.Array &&
    !!selectedKeyData?.name &&
    isEqualBuffers(selectedKeyData.name, keyProp)

  const addPredicate = useCallback(
    () => setPredicates((prev) => [...prev, newPredicate()]),
    [],
  )
  // Keep at least one row — the form never lets the list go empty.
  const removePredicate = useCallback(
    (index: number) =>
      setPredicates((prev) =>
        prev.length <= 1 ? prev : prev.filter((_, i) => i !== index),
      ),
    [],
  )
  const updatePredicate = useCallback(
    (index: number, patch: Partial<ArrayGrepPredicate>) =>
      setPredicates((prev) =>
        prev.map((predicate, i) =>
          i === index ? { ...predicate, ...patch } : predicate,
        ),
      ),
    [],
  )
  const updateOptions = useCallback(
    (patch: Partial<ArraySearchOptions>) =>
      setOptions((prev) => ({ ...prev, ...patch })),
    [],
  )

  const runSearch = useCallback(() => {
    if (!isArrayKeyReady || !keyProp) return
    // An unticked LIMIT sends no limit at all, so the server returns every
    // match (uncapped); ticking it caps the result set. Values are sent
    // verbatim — arrays can hold empty strings, so `EXACT ""` is valid.
    dispatch(
      searchArray({
        key: keyProp,
        predicates,
        combinator,
        start: options.start,
        end: options.end,
        nocase: options.nocase,
        withValues: options.withValues,
        limit: options.limitEnabled ? Number(options.limit) : undefined,
      }),
    )
  }, [dispatch, isArrayKeyReady, keyProp, predicates, combinator, options])

  // Restore the form to its defaults, abort any in-flight request, and drop
  // prior results. Shared by the key-switch effect and the form's "Reset to
  // defaults" action.
  const resetQuery = useCallback(() => {
    abortArraySearch()
    dispatch(resetArraySearch())
    setPredicates([newPredicate()])
    setCombinator(DEFAULT_SEARCH_COMBINATOR)
    setOptions(DEFAULT_SEARCH_OPTIONS)
  }, [dispatch])

  // Reset the form and drop prior results whenever the selected key
  // changes. Buffer-byte equality (via a ref) avoids refiring on a
  // referentially fresh buffer for the same logical key.
  const lastKeyRef = useRef<RedisResponseBuffer | null>(null)
  useEffect(() => {
    if (!keyProp) return
    if (lastKeyRef.current && isEqualBuffers(lastKeyRef.current, keyProp)) {
      return
    }
    lastKeyRef.current = keyProp
    resetQuery()
  }, [keyProp, resetQuery])

  // Cancel any in-flight search AND wipe the search sub-state on unmount so
  // a later re-mount doesn't paint the previous key's matches for a frame.
  useEffect(
    () => () => {
      abortArraySearch()
      dispatch(resetArraySearch())
    },
    [dispatch],
  )

  return {
    predicates,
    combinator,
    options,
    addPredicate,
    removePredicate,
    updatePredicate,
    setCombinator,
    updateOptions,
    runSearch,
    resetQuery,
    isArrayKeyReady,
    elements: data,
    loading,
    error,
    loaded,
  }
}
