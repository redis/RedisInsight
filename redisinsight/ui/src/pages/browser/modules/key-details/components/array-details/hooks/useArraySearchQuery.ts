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
import { ArrayGrepCriteria } from 'uiSrc/slices/interfaces/array'
import { DEFAULT_SEARCH_CRITERIA } from '../constants'

/**
 * Owns the Search tab's single-predicate ARGREP form state — the match
 * criteria and the value — and dispatches `searchArray` on demand.
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

  const [criteria, setCriteria] = useState<ArrayGrepCriteria>(
    DEFAULT_SEARCH_CRITERIA,
  )
  const [value, setValue] = useState<string>('')

  // Gated exactly like the View tab so a quick click during a key switch
  // can't fire ARGREP against a non-array key (which the API rejects with
  // WrongType).
  const isArrayKeyReady =
    !!keyProp &&
    selectedKeyData?.type === KeyTypes.Array &&
    !!selectedKeyData?.name &&
    isEqualBuffers(selectedKeyData.name, keyProp)

  const runSearch = useCallback(() => {
    if (!isArrayKeyReady || !keyProp) return
    // Value is sent verbatim, including empty/whitespace — arrays can hold
    // empty strings, so `EXACT ""` and space-bearing patterns are valid.
    dispatch(searchArray({ key: keyProp, predicates: [{ criteria, value }] }))
  }, [dispatch, isArrayKeyReady, keyProp, criteria, value])

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

    abortArraySearch()
    dispatch(resetArraySearch())
    setCriteria(DEFAULT_SEARCH_CRITERIA)
    setValue('')
  }, [dispatch, keyProp])

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
    criteria,
    value,
    setCriteria,
    setValue,
    runSearch,
    isArrayKeyReady,
    elements: data,
    loading,
    error,
    loaded,
  }
}
