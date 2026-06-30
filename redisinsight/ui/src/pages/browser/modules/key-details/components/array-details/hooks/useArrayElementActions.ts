import { useCallback, useMemo, useState } from 'react'

import { useAppDispatch } from 'uiSrc/slices/hooks'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { Nullable } from 'uiSrc/utils'
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
