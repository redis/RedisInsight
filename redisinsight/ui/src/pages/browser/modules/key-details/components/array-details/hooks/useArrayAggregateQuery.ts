import { useCallback, useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
import {
  abortArrayAggregate,
  aggregateArray,
  arrayAggregateSelector,
  clearArrayAggregate,
} from 'uiSrc/slices/browser/array'
import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { isEqualBuffers } from 'uiSrc/utils'
import { KeyTypes } from 'uiSrc/constants'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { ArrayAggregateOperation } from 'uiSrc/slices/interfaces/array'
import { DEFAULT_RANGE_END, DEFAULT_RANGE_START } from '../constants'

const DEFAULT_OPERATION = ArrayAggregateOperation.Sum
const DEFAULT_VALUE = ''

/**
 * Owns the Aggregate tab form state for an array key: range bounds, the
 * AROP operation, and the MATCH comparison value. Mirrors
 * `useArrayRangeQuery` (key-switch reset, AbortController on unmount) but
 * targets `state.browser.array.aggregate` so the View tab's table is not
 * affected by aggregate dispatches.
 */
export const useArrayAggregateQuery = (keyProp: RedisResponseBuffer | null) => {
  const dispatch = useAppDispatch()
  const { loading, error, result, hasResult } = useAppSelector(
    arrayAggregateSelector,
  )
  const selectedKeyData = useAppSelector(selectedKeyDataSelector)
  const { id: instanceId } = useAppSelector(connectedInstanceSelector)

  const [start, setStart] = useState<string>(DEFAULT_RANGE_START)
  const [end, setEnd] = useState<string>(DEFAULT_RANGE_END)
  const [operation, setOperation] =
    useState<ArrayAggregateOperation>(DEFAULT_OPERATION)
  const [value, setValue] = useState<string>(DEFAULT_VALUE)

  // Same readiness gate as the View tab: don't fire AROP against a key
  // whose confirmed type/name hasn't caught up with the clicked key yet.
  const isArrayKeyReady =
    !!keyProp &&
    selectedKeyData?.type === KeyTypes.Array &&
    !!selectedKeyData?.name &&
    isEqualBuffers(selectedKeyData.name, keyProp)

  const runQuery = useCallback(() => {
    if (!isArrayKeyReady || !keyProp) return
    sendEventTelemetry({
      event: TelemetryEvent.ARRAY_AGGREGATE_QUERY_RUN,
      eventData: { databaseId: instanceId, operation },
    })
    dispatch(
      aggregateArray({
        key: keyProp,
        start,
        end,
        operation,
        ...(operation === ArrayAggregateOperation.Match ? { value } : {}),
      }),
    )
  }, [
    dispatch,
    isArrayKeyReady,
    keyProp,
    start,
    end,
    operation,
    value,
    instanceId,
  ])

  // Reset form + aggregate slice when the selected key changes. Buffer-byte
  // equality (via refs) avoids refire on referentially fresh buffers for
  // the same logical key.
  const lastKeyRef = useRef<RedisResponseBuffer | null>(null)
  useEffect(() => {
    if (!keyProp) return
    if (lastKeyRef.current && isEqualBuffers(lastKeyRef.current, keyProp)) {
      return
    }
    lastKeyRef.current = keyProp

    abortArrayAggregate()
    dispatch(clearArrayAggregate())
    setStart(DEFAULT_RANGE_START)
    setEnd(DEFAULT_RANGE_END)
    setOperation(DEFAULT_OPERATION)
    setValue(DEFAULT_VALUE)
  }, [dispatch, keyProp])

  // Cancel any in-flight AROP and wipe the aggregate slice on unmount so
  // a stale result can't paint the previous key's value for one frame
  // after re-mount.
  useEffect(
    () => () => {
      abortArrayAggregate()
      dispatch(clearArrayAggregate())
    },
    [dispatch],
  )

  const resetQuery = useCallback(() => {
    abortArrayAggregate()
    dispatch(clearArrayAggregate())
    setStart(DEFAULT_RANGE_START)
    setEnd(DEFAULT_RANGE_END)
    setOperation(DEFAULT_OPERATION)
    setValue(DEFAULT_VALUE)
  }, [dispatch])

  return {
    start,
    end,
    operation,
    value,
    setStart,
    setEnd,
    setOperation,
    setValue,
    runQuery,
    resetQuery,
    isArrayKeyReady,
    loading,
    error,
    result,
    hasResult,
  }
}
