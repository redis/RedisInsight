import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'

import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import {
  selectedKeyDataSelector,
  selectedKeySelector,
  setSelectedKeyRefreshDisabled,
} from 'uiSrc/slices/browser/keys'
import {
  arraySelector,
  updateArrayElementAction,
} from 'uiSrc/slices/browser/array'
import { KeyValueCompressor } from 'uiSrc/constants'
import { Nullable, stringToSerializedBufferFormat } from 'uiSrc/utils'

import {
  ARRAY_TABLE_EMPTY_MESSAGE,
  ARRAY_TABLE_LOADING_MESSAGE,
} from './constants'
import {
  actionsColumn,
  arrayColumns,
  TABLE_MIN_WIDTH,
  TEST_ID,
} from './ArrayDetailsTable.config'
import {
  ArrayDetailsTableProps,
  ArrayTableConfig,
} from './ArrayDetailsTable.types'
import * as S from './ArrayDetailsTable.styles'

/**
 * Renders the array slice's currently-loaded `elements` through the
 * redis-ui `Table` (`@redis-ui/table`). Populated values are editable in
 * place (ARSET) via the value cell's inline editor; empty slots stay
 * read-only (see ArrayValueCell). Shows a per-row delete affordance when the
 * consumer passes `deleteConfig`.
 */
const ArrayDetailsTable = memo(
  ({
    elements,
    loading,
    error,
    isActive,
    renderExpandedRow,
    getIsRowExpandable,
    expandRowOnClick,
    deleteConfig,
  }: ArrayDetailsTableProps) => {
    const dispatch = useAppDispatch()
    const { compressor = null } = useAppSelector(
      connectedInstanceSelector,
    ) as unknown as { compressor: Nullable<KeyValueCompressor> }
    const { viewFormat } = useAppSelector(selectedKeySelector)
    const {
      updating,
      loading: rangeLoading,
      search,
    } = useAppSelector(arraySelector)
    // Block opening an edit while any read that writes a patched view is in
    // flight — range/scan (data.elements) or search (search.data), from either
    // tab — so a late response can't overwrite the optimistic patch. Read from
    // the slice, not the `loading` prop, so the View table also sees a search
    // loading on the hidden Search tab (and vice-versa).
    const readLoading = rangeLoading || search.loading
    // Use the selected key's name, not the array slice's `data.keyName` —
    // the latter is only set after a View range/scan succeeds, but this table
    // is also rendered by the Search tab, so an edit there (or before View
    // loads) would otherwise POST ARSET with an empty key.
    const { name: keyName } = useAppSelector(selectedKeyDataSelector) ?? {
      name: '',
    }

    // Index of the row currently being edited; only one row edits at a time.
    const [editingIndex, setEditingIndex] = useState<Nullable<string>>(null)

    // Only the visible tab's table drives the editor-driven refresh pause, so
    // a hidden table can't re-enable refresh while the active one has an editor
    // open. Stays paused until the editor closes AND the ARSET settles, so a
    // stale reload can't overwrite the optimistic patch mid-write. (This effect
    // intentionally omits `editingIndex` from the inactive path — only the
    // active table reacts to it.)
    useEffect(() => {
      if (!isActive) return
      dispatch(setSelectedKeyRefreshDisabled(editingIndex !== null || updating))
    }, [isActive, editingIndex, updating, dispatch])

    // When a table is hidden (tab switch) or unmounts, it releases the shared
    // flag but still respects an in-flight write (global), so switching to a
    // tab without a table can't leave refresh stuck disabled.
    useEffect(() => {
      if (isActive) return
      dispatch(setSelectedKeyRefreshDisabled(updating))
    }, [isActive, updating, dispatch])

    // Abandon an open editor when this table is hidden (tab switch) or the key
    // changes, so a background editor can't keep refresh disabled and a stale
    // editing state can't carry over.
    useEffect(() => {
      if (!isActive) setEditingIndex(null)
    }, [isActive])

    useEffect(() => {
      setEditingIndex(null)
    }, [keyName])

    // Re-enable refresh when the table unmounts entirely (panel close).
    useEffect(
      () => () => {
        dispatch(setSelectedKeyRefreshDisabled(false))
      },
      [dispatch],
    )

    const handleEditElement = useCallback(
      (index: string, isEditing: boolean) => {
        setEditingIndex(isEditing ? index : null)
      },
      [],
    )

    const handleApplyEditElement = useCallback(
      (index: string, value: string) => {
        dispatch(
          updateArrayElementAction(
            {
              key: keyName,
              index,
              value: stringToSerializedBufferFormat(viewFormat, value),
            },
            () => handleEditElement(index, false),
          ),
        )
      },
      [dispatch, keyName, viewFormat, handleEditElement],
    )

    // Pass shared per-cell config via the table's `meta` so the static
    // column defs in `ArrayDetailsTable.config` don't need to close over
    // them and can be rebuilt only when their inputs change.
    const meta = useMemo<ArrayTableConfig>(
      () => ({
        compressor,
        viewFormat,
        editingIndex,
        onEditElement: handleEditElement,
        onApplyEditElement: handleApplyEditElement,
        updating,
        loading: readLoading,
        deleteConfig,
      }),
      [
        compressor,
        viewFormat,
        editingIndex,
        handleEditElement,
        handleApplyEditElement,
        updating,
        readLoading,
        deleteConfig,
      ],
    )

    // The delete column is appended only when the consumer opts in, so the
    // View / Aggregate tabs without a `deleteConfig` show no actions column.
    // Depend on its presence, not its identity: the cell reads the live popover
    // state from `meta`, so rebuilding `columns` on every `deleting` change
    // would needlessly reset table state (e.g. expanded Search context rows).
    const hasActionsColumn = Boolean(deleteConfig)
    const columns = useMemo(
      () =>
        hasActionsColumn ? [...arrayColumns, actionsColumn] : arrayColumns,
      [hasActionsColumn],
    )

    // Use `||` rather than `??` here: the array slice clears `error` to `''`
    // after a successful request, and `''` is not nullish, so `??` would
    // surface the empty string and the table would render with no text on
    // an empty-but-successful range/scan.
    const emptyState = loading
      ? ARRAY_TABLE_LOADING_MESSAGE
      : error || ARRAY_TABLE_EMPTY_MESSAGE

    return (
      <S.Container data-testid={TEST_ID}>
        <S.StyledTable
          columns={columns}
          data={elements}
          meta={meta}
          stripedRows
          minWidth={TABLE_MIN_WIDTH}
          emptyState={emptyState}
          renderExpandedRow={renderExpandedRow}
          getIsRowExpandable={getIsRowExpandable}
          expandRowOnClick={expandRowOnClick}
          data-testid={`${TEST_ID}-table`}
        />
      </S.Container>
    )
  },
)

export { ArrayDetailsTable }
