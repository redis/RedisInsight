import { useCallback, useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
import {
  abortArrayRange,
  arrayDataSelector,
  arraySelector,
  fetchArrayRange,
  scanArrayRange,
  setArrayActiveQuery,
  setArrayInitialState,
} from 'uiSrc/slices/browser/array'
import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import { isEqualBuffers } from 'uiSrc/utils'
import { KeyTypes } from 'uiSrc/constants'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import {
  DEFAULT_RANGE_END,
  DEFAULT_RANGE_START,
  REVEAL_WINDOW_SIZE,
} from '../constants'

// BigInt() throws on a non-numeric string. The range fields can hold a
// half-typed / invalid value, so parse defensively — a throw here would run in
// the post-add success path and abort the panel close + refresh after a write
// that already succeeded.
const toBigIntOrNull = (value: string): bigint | null => {
  try {
    return BigInt(value)
  } catch {
    return null
  }
}

/**
 * Owns the View / Browse tab query state for an array key: the inclusive
 * `start`/`end` bounds and the "show empty indexes" toggle that switches
 * between ARGETRANGE (gap-preserving) and ARSCAN (populated-only).
 *
 * Takes the raw `keyProp` buffer (threaded through `KeyDetails` →
 * `DynamicTypeDetails`) rather than reading `selectedKeyData?.name` —
 * the selector lags selection by one `fetchKeyInfo` round-trip.
 */
export const useArrayRangeQuery = (keyProp: RedisResponseBuffer | null) => {
  const dispatch = useAppDispatch()
  const { loading, error } = useAppSelector(arraySelector)
  const data = useAppSelector(arrayDataSelector)
  const selectedKeyData = useAppSelector(selectedKeyDataSelector)

  const [start, setStart] = useState<string>(DEFAULT_RANGE_START)
  const [end, setEnd] = useState<string>(DEFAULT_RANGE_END)
  const [showEmpty, setShowEmpty] = useState<boolean>(true)

  // Manual + auto dispatches are gated on this so a quick click during a
  // key-switch can't fire ARGETRANGE/ARSCAN against a non-array key
  // (which the API rejects with WrongType).
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

  // Switch detection and fetching are split across two effects so the
  // fetch can wait for `selectedKeyData` to catch up. Buffer-byte equality
  // (via refs) avoids a refire on referentially fresh buffers for the
  // same logical key, and handles binary-distinct keys whose lossy
  // `bufferToString` forms would collide.
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
    if (!isArrayKeyReady || !keyProp) return
    // Fire only once per key switch.
    if (
      fetchedKeyRef.current &&
      isEqualBuffers(fetchedKeyRef.current, keyProp)
    ) {
      return
    }
    fetchedKeyRef.current = keyProp
    const params = { key: keyProp, start, end }
    dispatch(showEmpty ? fetchArrayRange(params) : scanArrayRange(params))
  }, [dispatch, isArrayKeyReady, keyProp, start, end, showEmpty])

  // Cancel any in-flight range/scan AND wipe the slice on unmount so a
  // later re-mount (e.g. user navigates away from an array key and then
  // opens another one) doesn't paint the previous key's elements for one
  // frame before the switch effect runs.
  useEffect(
    () => () => {
      abortArrayRange()
      dispatch(setArrayInitialState())
    },
    [dispatch],
  )

  // Restore form defaults and refire the default-range query. Keeps the
  // current data in the slice (`resetData: false`) to avoid a visible
  // blank flicker between reset and the fresh ARGETRANGE result.
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
        resetData: false,
      }),
    )
  }, [dispatch, isArrayKeyReady, keyProp])

  // Move the window so `index` is visible — used after an add whose element
  // lands outside the current range (e.g. an append at the new tail). No-op
  // when it's already within the window. Sets the form bounds AND the slice's
  // active query (without fetching) so the caller's refreshArray replays the
  // new window and the form inputs stay in sync.
  const revealIndex = useCallback(
    (index: string) => {
      const target = toBigIntOrNull(index)
      if (target === null) return

      // If the range fields are valid and already cover the index, leave the
      // window alone. When they can't be parsed, fall through and reveal — that
      // also replaces the unusable bounds with a valid window ending at `index`.
      const lo = toBigIntOrNull(start)
      const hi = toBigIntOrNull(end)
      const withinWindow =
        lo !== null &&
        hi !== null &&
        target >= (lo < hi ? lo : hi) &&
        target <= (lo < hi ? hi : lo)
      if (withinWindow) return

      const span = BigInt(REVEAL_WINDOW_SIZE - 1)
      const nextStart = (target > span ? target - span : BigInt(0)).toString()
      setStart(nextStart)
      setEnd(index)
      dispatch(setArrayActiveQuery({ start: nextStart, end: index, showEmpty }))
    },
    [dispatch, start, end, showEmpty],
  )

  return {
    start,
    end,
    showEmpty,
    setStart,
    setEnd,
    setShowEmpty,
    runQuery,
    resetQuery,
    revealIndex,
    isArrayKeyReady,
    elements: data?.elements ?? [],
    loading,
    error,
  }
}
