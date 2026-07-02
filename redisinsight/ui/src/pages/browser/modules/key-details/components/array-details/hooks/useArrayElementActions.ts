import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useAppDispatch } from 'uiSrc/slices/hooks'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { Nullable, isEqualBuffers } from 'uiSrc/utils'
import { deleteArrayElements } from 'uiSrc/slices/browser/array'

import { ArrayElementDeleteConfig } from '../array-details-table/components/RowActionsCell'
import {
  UseArrayElementActionsParams,
  UseArrayElementActionsResult,
} from './useArrayElementActions.types'

// Disambiguates this popover's `deleting` token from any other delete popover
// mounted at the same time.
const ELEMENT_DELETE_POPOVER_SUFFIX = '-array-element'

/**
 * Owns the per-row delete popover state for the array element table and
 * dispatches the delete. Used by both the View and Search tabs; the thunk
 * refreshes every loaded array view afterwards, so the caller only varies
 * `hideEmptySlots`.
 */
export const useArrayElementActions = (
  keyProp: Nullable<RedisResponseBuffer>,
  { hideEmptySlots }: UseArrayElementActionsParams,
): UseArrayElementActionsResult => {
  const dispatch = useAppDispatch()
  const [deleting, setDeleting] = useState('')

  const closePopover = useCallback(() => setDeleting(''), [])
  const showPopover = useCallback(
    (item = '') => setDeleting(`${item}${ELEMENT_DELETE_POPOVER_SUFFIX}`),
    [],
  )

  // Drop any open confirm popover on a real key change (the tab stays mounted
  // across key switches). Otherwise a row with the same index on the new key
  // would show a stale-open dialog whose confirm deletes against the wrong key.
  const lastKeyRef = useRef<Nullable<RedisResponseBuffer>>(null)
  useEffect(() => {
    if (
      lastKeyRef.current &&
      keyProp &&
      isEqualBuffers(lastKeyRef.current, keyProp)
    ) {
      return
    }
    lastKeyRef.current = keyProp
    closePopover()
  }, [keyProp, closePopover])
  const handleDeleteElement = useCallback(
    (index: string) => {
      if (!keyProp) return
      dispatch(deleteArrayElements(keyProp, [index]))
      closePopover()
    },
    [dispatch, keyProp, closePopover],
  )

  const deleteConfig = useMemo<ArrayElementDeleteConfig>(
    () => ({
      deleting,
      suffix: ELEMENT_DELETE_POPOVER_SUFFIX,
      hideEmptySlots,
      closePopover,
      showPopover,
      handleDeleteElement,
    }),
    [deleting, hideEmptySlots, closePopover, showPopover, handleDeleteElement],
  )

  return { deleteConfig }
}
