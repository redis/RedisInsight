import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'

import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import {
  selectedKeyDataSelector,
  selectedKeySelector,
  setSelectedKeyRefreshDisabled,
} from 'uiSrc/slices/browser/keys'
import { updateArrayElementAction } from 'uiSrc/slices/browser/array'
import { KeyValueCompressor } from 'uiSrc/constants'
import { Nullable, stringToSerializedBufferFormat } from 'uiSrc/utils'

import {
  ARRAY_TABLE_EMPTY_MESSAGE,
  ARRAY_TABLE_LOADING_MESSAGE,
} from './constants'
import {
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
 * read-only (see ArrayValueCell). Row-level delete / range affordances ship
 * with the Delete vertical (docs/redis-array-type-initiative.md §6 Task 7).
 */
const ArrayDetailsTable = memo(
  ({ elements, loading, error }: ArrayDetailsTableProps) => {
    const dispatch = useAppDispatch()
    const { compressor = null } = useAppSelector(
      connectedInstanceSelector,
    ) as unknown as { compressor: Nullable<KeyValueCompressor> }
    const { viewFormat } = useAppSelector(selectedKeySelector)
    // Use the selected key's name, not the array slice's `data.keyName` —
    // the latter is only set after a View range/scan succeeds, but this table
    // is also rendered by the Search tab, so an edit there (or before View
    // loads) would otherwise POST ARSET with an empty key.
    const { name: keyName } = useAppSelector(selectedKeyDataSelector) ?? {
      name: '',
    }

    // Index of the row currently being edited; only one row edits at a time.
    const [editingIndex, setEditingIndex] = useState<Nullable<string>>(null)

    // Re-enable the key-header refresh when this table unmounts (panel close
    // or tab teardown) so an editor left open can't leave refresh stuck off —
    // both tabs mount their own table, so this can't rely on a sibling.
    useEffect(
      () => () => {
        dispatch(setSelectedKeyRefreshDisabled(false))
      },
      [dispatch],
    )

    // On key switch, abandon any open editor and re-enable refresh so a stuck
    // editing state from the previous key can't carry over.
    useEffect(() => {
      setEditingIndex(null)
      dispatch(setSelectedKeyRefreshDisabled(false))
    }, [keyName, dispatch])

    const handleEditElement = useCallback(
      (index: string, isEditing: boolean) => {
        setEditingIndex(isEditing ? index : null)
        // Pause the key-header refresh while editing so an in-flight reload
        // can't swap the table out from under the open editor.
        dispatch(setSelectedKeyRefreshDisabled(isEditing))
      },
      [dispatch],
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
      }),
      [
        compressor,
        viewFormat,
        editingIndex,
        handleEditElement,
        handleApplyEditElement,
      ],
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
          columns={arrayColumns}
          data={elements}
          meta={meta}
          stripedRows
          minWidth={TABLE_MIN_WIDTH}
          emptyState={emptyState}
          data-testid={`${TEST_ID}-table`}
        />
      </S.Container>
    )
  },
)

export { ArrayDetailsTable }
