import { useCallback, useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
import {
  arrayDataSelector,
  arraySelector,
  fetchArrayRange,
  scanArrayRange,
  setArrayInitialState,
} from 'uiSrc/slices/browser/array'
import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import { bufferToString } from 'uiSrc/utils'
import { DEFAULT_RANGE_END, DEFAULT_RANGE_START } from '../constants'

/**
 * Owns the View / Browse tab query state for an array key. Holds the
 * inclusive range (`start`/`end`) and the "show empty indexes" toggle
 * that switches between ARGETRANGE (gap-preserving) and ARSCAN
 * (populated-only). The range bounds alone size the result — users who
 * want narrower or wider slices change the bounds directly. Auto-fires
 * the initial query when a new key is selected and on user-triggered
 * refresh.
 */
export const useArrayRangeQuery = () => {
  const dispatch = useAppDispatch()
  const selectedKeyData = useAppSelector(selectedKeyDataSelector)
  const { loading, error } = useAppSelector(arraySelector)
  const data = useAppSelector(arrayDataSelector)

  const [start, setStart] = useState<string>(DEFAULT_RANGE_START)
  const [end, setEnd] = useState<string>(DEFAULT_RANGE_END)
  const [showEmpty, setShowEmpty] = useState<boolean>(true)

  const keyBuffer = selectedKeyData?.name
  const keyName = keyBuffer ? bufferToString(keyBuffer) : ''

  const runQuery = useCallback(
    (nextStart: string = start, nextEnd: string = end) => {
      if (!keyBuffer) return
      if (showEmpty) {
        dispatch(
          fetchArrayRange({
            key: keyBuffer,
            start: nextStart,
            end: nextEnd,
          }),
        )
      } else {
        dispatch(
          scanArrayRange({
            key: keyBuffer,
            start: nextStart,
            end: nextEnd,
          }),
        )
      }
    },
    [dispatch, keyBuffer, showEmpty, start, end],
  )

  // Reset slice + fire the default-range query whenever the user switches
  // keys. Refresh is owned by `refreshKey` (in `slices/browser/keys`) so
  // this effect intentionally does NOT depend on `lastRefreshTime` — the
  // range thunks update `lastRefreshTime` themselves on success, which
  // would otherwise create a fetch-update-fetch loop.
  useEffect(() => {
    if (!keyBuffer) return
    dispatch(setArrayInitialState())
    setStart(DEFAULT_RANGE_START)
    setEnd(DEFAULT_RANGE_END)
    setShowEmpty(true)
    dispatch(
      fetchArrayRange({
        key: keyBuffer,
        start: DEFAULT_RANGE_START,
        end: DEFAULT_RANGE_END,
      }),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, keyName])

  // Restore form defaults and refire the default-range query. The slice
  // is intentionally NOT wiped — keeping the current data prevents a
  // visible "blank" flicker between reset and the fresh ARGETRANGE.
  const resetQuery = useCallback(() => {
    setStart(DEFAULT_RANGE_START)
    setEnd(DEFAULT_RANGE_END)
    setShowEmpty(true)
    if (!keyBuffer) return
    dispatch(
      fetchArrayRange({
        key: keyBuffer,
        start: DEFAULT_RANGE_START,
        end: DEFAULT_RANGE_END,
      }),
    )
  }, [dispatch, keyBuffer])

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
