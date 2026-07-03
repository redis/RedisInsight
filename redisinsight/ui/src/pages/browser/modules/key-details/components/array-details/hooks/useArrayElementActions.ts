import { AxiosError } from 'axios'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useAppDispatch } from 'uiSrc/slices/hooks'
import i18n from 'uiSrc/i18n'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { Nullable, isEqualBuffers } from 'uiSrc/utils'
import { deleteArrayElements } from 'uiSrc/slices/browser/array'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { ArrayDataElement } from 'uiSrc/slices/interfaces/array'

import { ARRAY_BULK_DELETE_MAX } from '../constants'
import { ArrayElementDeleteConfig } from '../array-details-table/components/RowActionsCell'
import { ArrayBulkDeleteConfig } from '../array-details-table/components/BulkDeleteHeaderCell'
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

  // Selection is keyed by element index (the table's `getRowId`). Declared
  // before the single-delete handler so a per-row delete can drop the
  // just-deleted row from any live multi-select.
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const clearSelection = useCallback(() => setRowSelection({}), [])

  const handleDeleteElement = useCallback(
    async (index: string) => {
      if (!keyProp) return
      closePopover()
      const deleted = await dispatch(deleteArrayElements(keyProp, [index]))
      // On success drop the deleted row from the multi-selection, so the bulk
      // header can't re-delete it in the window before the refresh prunes it.
      if (deleted) {
        setRowSelection((prev) => {
          if (!prev[index]) return prev
          const next = { ...prev }
          delete next[index]
          return next
        })
      }
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

  // The indexes currently rendered and selectable. A new View range or Search
  // replaces `elements` under a live selection, so the raw `rowSelection` can
  // hold indexes the user can no longer see.
  const selectableIndexes = useMemo(
    () =>
      new Set(
        elements.filter(canSelectElement).map((element) => element.index),
      ),
    [elements, canSelectElement],
  )

  // Count and delete only the still-visible selection. Derived (not just the
  // pruned state below) so it's correct on the same render the result set
  // changes — a bulk delete can never fire against an index scrolled out of
  // view, which would be unacceptable for a destructive action.
  const selectedIndexes = useMemo(
    () =>
      Object.keys(rowSelection).filter(
        (index) => rowSelection[index] && selectableIndexes.has(index),
      ),
    [rowSelection, selectableIndexes],
  )

  // Prune the controlled selection state itself once rows drop out of view. A
  // stale id left in `rowSelection` would resurrect its checkbox (and the bulk
  // count) if a later range/search brought that index back. Only writes when an
  // entry actually drops, so a refresh that keeps every selected row is a no-op.
  useEffect(() => {
    setRowSelection((prev) => {
      const pruned: Record<string, boolean> = {}
      let changed = false
      Object.keys(prev).forEach((index) => {
        if (prev[index] && selectableIndexes.has(index)) pruned[index] = true
        else changed = true
      })
      return changed ? pruned : prev
    })
  }, [selectableIndexes])

  // Guard against a double-confirm firing the delete twice: stay busy for the
  // whole round-trip. Clear the selection only on success — the deleted rows
  // are gone, so drop them (and the header trigger) immediately rather than
  // waiting for the refresh to land, which would leave a window to re-delete.
  // A failed delete keeps the selection so the user can retry.
  const bulkDeletingRef = useRef(false)
  const handleBulkDelete = useCallback(async () => {
    if (!keyProp || selectedIndexes.length === 0 || bulkDeletingRef.current) {
      return
    }
    // The delete endpoint caps indexes per call; an unbounded Search can select
    // more than that. Fail fast with a clear message instead of a raw 400.
    if (selectedIndexes.length > ARRAY_BULK_DELETE_MAX) {
      dispatch(
        addErrorNotification({
          response: {
            data: {
              title: i18n.t('notification.error.arrayBulkDeleteLimit.title'),
              message: i18n.t(
                'notification.error.arrayBulkDeleteLimit.message',
                { max: ARRAY_BULK_DELETE_MAX.toLocaleString('en-US') },
              ),
            },
          },
        } as AxiosError),
      )
      return
    }
    bulkDeletingRef.current = true
    try {
      const deleted = await dispatch(
        deleteArrayElements(keyProp, selectedIndexes),
      )
      if (deleted) clearSelection()
    } finally {
      bulkDeletingRef.current = false
    }
  }, [dispatch, keyProp, selectedIndexes, clearSelection])

  const bulkDeleteConfig = useMemo<ArrayBulkDeleteConfig>(
    () => ({ selectedCount: selectedIndexes.length, handleBulkDelete }),
    [selectedIndexes.length, handleBulkDelete],
  )

  return {
    deleteConfig,
    selectionConfig,
    bulkDeleteConfig,
    clearSelection,
  }
}
