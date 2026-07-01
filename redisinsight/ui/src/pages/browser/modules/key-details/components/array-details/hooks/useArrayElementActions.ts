import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useAppDispatch } from 'uiSrc/slices/hooks'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { Nullable, isEqualBuffers } from 'uiSrc/utils'
import { deleteArrayElements } from 'uiSrc/slices/browser/array'
import { ArrayDataElement } from 'uiSrc/slices/interfaces/array'

import { ArrayElementDeleteConfig } from '../array-details-table/components/RowActionsCell'
import { ArrayElementSelectionConfig } from '../array-details-table/ArrayDetailsTable.types'
import {
  UseArrayElementActionsParams,
  UseArrayElementActionsResult,
} from './useArrayElementActions.types'

// Disambiguates this popover's `deleting` token from any other delete popover
// mounted at the same time.
const ELEMENT_DELETE_POPOVER_SUFFIX = '-array-element'

/**
 * Owns the per-row delete popover state AND the multi-select state for the
 * array element table, and dispatches both the single- and bulk-delete. Used
 * by the View and Search tabs; the thunk refreshes every loaded array view
 * afterwards, so the caller only varies `hideEmptySlots`.
 */
export const useArrayElementActions = (
  keyProp: Nullable<RedisResponseBuffer>,
  { elements, hideEmptySlots }: UseArrayElementActionsParams,
): UseArrayElementActionsResult => {
  const dispatch = useAppDispatch()

  // --- single-element delete popover ---
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

  // --- multi-select + bulk delete ---
  // Selection is keyed by element index (the table's `getRowId`).
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const clearSelection = useCallback(() => setRowSelection({}), [])

  // On a real key change (the tab stays mounted across key switches) drop both
  // the open confirm popover — a same-index row on the new key would otherwise
  // show a stale dialog that deletes the wrong key — and the selection, since a
  // stale multi-select on a destructive action is dangerous.
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
    clearSelection()
  }, [keyProp, closePopover, clearSelection])

  // A null value is an empty slot only in the gap-preserving View; Search
  // index-only matches are real, selectable elements.
  const canSelectElement = useCallback(
    (element: ArrayDataElement) => !(hideEmptySlots && element.value == null),
    [hideEmptySlots],
  )

  const selectionConfig = useMemo<ArrayElementSelectionConfig>(
    () => ({
      rowSelection,
      onRowSelectionChange: setRowSelection,
      getRowCanSelect: canSelectElement,
    }),
    [rowSelection, canSelectElement],
  )

  // Prune the selection to the currently-rendered, selectable rows. A new View
  // range or Search replaces `elements` under a live selection, so counting or
  // deleting a raw `rowSelection` entry could hit an index the user can no
  // longer see — unacceptable for a destructive bulk action.
  const selectableIndexes = useMemo(
    () =>
      new Set(
        elements.filter(canSelectElement).map((element) => element.index),
      ),
    [elements, canSelectElement],
  )
  const selectedIndexes = useMemo(
    () =>
      Object.keys(rowSelection).filter(
        (index) => rowSelection[index] && selectableIndexes.has(index),
      ),
    [rowSelection, selectableIndexes],
  )

  const handleBulkDelete = useCallback(() => {
    if (!keyProp || selectedIndexes.length === 0) return
    dispatch(deleteArrayElements(keyProp, selectedIndexes))
    clearSelection()
  }, [dispatch, keyProp, selectedIndexes, clearSelection])

  return {
    deleteConfig,
    selectionConfig,
    selectedCount: selectedIndexes.length,
    handleBulkDelete,
    clearSelection,
  }
}
