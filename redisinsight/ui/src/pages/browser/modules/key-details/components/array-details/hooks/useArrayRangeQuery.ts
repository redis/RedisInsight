import { useCallback, useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
import {
  arrayDataSelector,
  arraySelector,
  fetchArrayRange,
  scanArrayRange,
  setArrayInitialState,
} from 'uiSrc/slices/browser/array'
import { isEqualBuffers } from 'uiSrc/utils'
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

  const [start, setStart] = useState<string>(DEFAULT_RANGE_START)
  const [end, setEnd] = useState<string>(DEFAULT_RANGE_END)
  const [showEmpty, setShowEmpty] = useState<boolean>(true)

  const runQuery = useCallback(
    (nextStart: string = start, nextEnd: string = end) => {
      if (!keyProp) return
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
    [dispatch, keyProp, showEmpty, start, end],
  )

  // Detect key switches by raw-buffer byte equality so two binary-distinct
  // keys whose lossy `bufferToString` forms collide (e.g. invalid UTF-8
  // decoded with the U+FFFD replacement character) still trigger a
  // refetch. Stored in a ref because two buffer references with the same
  // bytes should be treated as the same key — React's default referential
  // equality on the dep array would otherwise refire on every render that
  // produces a fresh buffer instance for the same logical key.
  //
  // Refresh is owned by `refreshKey` (in `slices/browser/keys`) so this
  // effect intentionally does NOT depend on `lastRefreshTime` — the range
  // thunks update `lastRefreshTime` themselves on success, which would
  // otherwise create a fetch-update-fetch loop.
  const lastKeyRef = useRef<RedisResponseBuffer | null>(null)
  useEffect(() => {
    if (!keyProp) return
    if (lastKeyRef.current && isEqualBuffers(lastKeyRef.current, keyProp)) {
      return
    }
    lastKeyRef.current = keyProp

    dispatch(setArrayInitialState())
    setStart(DEFAULT_RANGE_START)
    setEnd(DEFAULT_RANGE_END)
    setShowEmpty(true)
    dispatch(
      fetchArrayRange({
        key: keyProp,
        start: DEFAULT_RANGE_START,
        end: DEFAULT_RANGE_END,
      }),
    )
  }, [dispatch, keyProp])

  // Restore form defaults and refire the default-range query. The slice
  // is intentionally NOT wiped — keeping the current data prevents a
  // visible "blank" flicker between reset and the fresh ARGETRANGE.
  const resetQuery = useCallback(() => {
    setStart(DEFAULT_RANGE_START)
    setEnd(DEFAULT_RANGE_END)
    setShowEmpty(true)
    if (!keyProp) return
    dispatch(
      fetchArrayRange({
        key: keyProp,
        start: DEFAULT_RANGE_START,
        end: DEFAULT_RANGE_END,
      }),
    )
  }, [dispatch, keyProp])

  return {
    start,
    end,
    showEmpty,
    setStart,
    setEnd,
    setShowEmpty,
    runQuery,
    resetQuery,
    elements: data?.elements ?? [],
    loading,
    error,
  }
}
