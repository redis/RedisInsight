import { useCallback, useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
import {
  abortArrayRange,
  arrayDataSelector,
  arraySelector,
  fetchArrayRange,
  scanArrayRange,
  setArrayInitialState,
} from 'uiSrc/slices/browser/array'
import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import { isEqualBuffers } from 'uiSrc/utils'
import { KeyTypes } from 'uiSrc/constants'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { DEFAULT_RANGE_END, DEFAULT_RANGE_START } from '../constants'

/**
 * Owns the View / Browse tab query state for an array key. Holds the
 * inclusive range (`start`/`end`) and the "show empty indexes" toggle
 * that switches between ARGETRANGE (gap-preserving) and ARSCAN
 * (populated-only). The range bounds alone size the result — users who
 * want narrower or wider slices change the bounds directly. Auto-fires
 * the initial query when a new key is selected and on user-triggered
 * refresh.
 *
 * Takes the raw `keyProp` buffer (the same identity threaded through
 * `KeyDetails` → `DynamicTypeDetails`) rather than reading
 * `selectedKeyData?.name`. The selector lags behind selection by one
 * `fetchKeyInfo` round-trip, which would render the previous key's
 * data until that completes; `keyProp` updates synchronously on click.
 */
export const useArrayRangeQuery = (keyProp: RedisResponseBuffer | null) => {
  const dispatch = useAppDispatch()
  const { loading, error } = useAppSelector(arraySelector)
  const data = useAppSelector(arrayDataSelector)
  const selectedKeyData = useAppSelector(selectedKeyDataSelector)

  const [start, setStart] = useState<string>(DEFAULT_RANGE_START)
  const [end, setEnd] = useState<string>(DEFAULT_RANGE_END)
  const [showEmpty, setShowEmpty] = useState<boolean>(true)

  // True only once `fetchKeyInfo` has resolved and the resulting
  // `selectedKeyData` matches the currently selected `keyProp` AND has
  // type Array. Manual user actions (Run / Reset) are gated on this so a
  // quick click during the key-switch window can't dispatch ARGETRANGE /
  // ARSCAN against a non-array key (which the API rejects with a
  // WrongType 400). The auto-fetch effect uses the same condition.
  const isArrayKeyReady =
    !!keyProp &&
    selectedKeyData?.type === KeyTypes.Array &&
    !!selectedKeyData?.name &&
    isEqualBuffers(selectedKeyData.name, keyProp)

  const runQuery = useCallback(
    (nextStart: string = start, nextEnd: string = end) => {
      if (!isArrayKeyReady || !keyProp) return
      if (showEmpty) {
        dispatch(
          fetchArrayRange({
            key: keyProp,
            start: nextStart,
            end: nextEnd,
          }),
        )
      } else {
        dispatch(
          scanArrayRange({
            key: keyProp,
            start: nextStart,
            end: nextEnd,
          }),
        )
      }
    },
    [dispatch, isArrayKeyReady, keyProp, showEmpty, start, end],
  )

  // Detect key switches by raw-buffer byte equality so two binary-distinct
  // keys whose lossy `bufferToString` forms collide (e.g. invalid UTF-8
  // decoded with the U+FFFD replacement character) still trigger a
  // refetch. Stored in a ref because two buffer references with the same
  // bytes should be treated as the same key — React's default referential
  // equality on the dep array would otherwise refire on every render that
  // produces a fresh buffer instance for the same logical key.
  //
  // Switch detection and fetching are split across two effects so the
  // fetch can be gated on the resolved key type (avoiding a WrongType
  // 400 when the user clicks a non-array key while ArrayDetails is still
  // mounted from the previous selection). The first effect handles the
  // synchronous part — abort, reset form, wipe slice — keyed off
  // `keyProp` alone. The second effect waits for `selectedKeyData` to
  // catch up via `fetchKeyInfo` and only fires the request once the
  // confirmed type is Array AND the confirmed name matches `keyProp`.
  //
  // Refresh is owned by `refreshKey` (in `slices/browser/keys`) so this
  // effect intentionally does NOT depend on `lastRefreshTime` — the range
  // thunks update `lastRefreshTime` themselves on success, which would
  // otherwise create a fetch-update-fetch loop.
  const lastKeyRef = useRef<RedisResponseBuffer | null>(null)
  const fetchedKeyRef = useRef<RedisResponseBuffer | null>(null)
  useEffect(() => {
    if (!keyProp) return
    if (lastKeyRef.current && isEqualBuffers(lastKeyRef.current, keyProp)) {
      return
    }
    lastKeyRef.current = keyProp
    fetchedKeyRef.current = null

    abortArrayRange()
    dispatch(setArrayInitialState())
    setStart(DEFAULT_RANGE_START)
    setEnd(DEFAULT_RANGE_END)
    setShowEmpty(true)
  }, [dispatch, keyProp])

  useEffect(() => {
    // Gate on confirmed type from the selected-key slice: until
    // `fetchKeyInfo` resolves with `type === Array` and a `name` that
    // matches our `keyProp`, dispatching ARGETRANGE would hit the API
    // with a key of unknown / mismatched type and surface a WrongType
    // 400. Skip silently — this effect refires when the slice catches
    // up.
    if (!isArrayKeyReady || !keyProp) return
    // Fire only once per key switch; subsequent renders for the same
    // confirmed selection (e.g. unrelated slice updates) must not refire.
    if (
      fetchedKeyRef.current &&
      isEqualBuffers(fetchedKeyRef.current, keyProp)
    ) {
      return
    }
    fetchedKeyRef.current = keyProp
    dispatch(
      fetchArrayRange({
        key: keyProp,
        start: DEFAULT_RANGE_START,
        end: DEFAULT_RANGE_END,
      }),
    )
  }, [dispatch, isArrayKeyReady, keyProp])

  // On unmount (e.g. user navigates away from an array key), cancel any
  // in-flight range/scan so its late response can't land into a stale
  // slice. The slice-level controller is shared between range and scan,
  // so this also covers a pending ARSCAN.
  useEffect(() => () => abortArrayRange(), [])

  // Restore form defaults and refire the default-range query. The slice
  // is intentionally NOT wiped — keeping the current data prevents a
  // visible "blank" flicker between reset and the fresh ARGETRANGE.
  // Same readiness gate as `runQuery` so a Reset click during a key
  // switch can't dispatch against a non-array key either.
  const resetQuery = useCallback(() => {
    setStart(DEFAULT_RANGE_START)
    setEnd(DEFAULT_RANGE_END)
    setShowEmpty(true)
    if (!isArrayKeyReady || !keyProp) return
    dispatch(
      fetchArrayRange({
        key: keyProp,
        start: DEFAULT_RANGE_START,
        end: DEFAULT_RANGE_END,
      }),
    )
  }, [dispatch, isArrayKeyReady, keyProp])

  return {
    start,
    end,
    showEmpty,
    setStart,
    setEnd,
    setShowEmpty,
    runQuery,
    resetQuery,
    isArrayKeyReady,
    elements: data?.elements ?? [],
    loading,
    error,
  }
}
