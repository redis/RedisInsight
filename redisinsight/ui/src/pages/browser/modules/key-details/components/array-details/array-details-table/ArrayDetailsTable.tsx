import React, { memo, useMemo } from 'react'
import { useAppSelector } from 'uiSrc/slices/hooks'

import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { selectedKeySelector } from 'uiSrc/slices/browser/keys'
import { KeyValueCompressor } from 'uiSrc/constants'
import { Nullable } from 'uiSrc/utils'
import { Row, Table } from 'uiSrc/components/base/layout/table'
import { ArrayDataElement } from 'uiSrc/slices/interfaces/array'

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
 * redis-ui `Table` (`@redis-ui/table`). Shows a per-row delete affordance
 * when the consumer passes `deleteConfig`; otherwise the table is read-only.
 */
const ArrayDetailsTable = memo(
  ({
    elements,
    loading,
    error,
    renderExpandedRow,
    getIsRowExpandable,
    expandRowOnClick,
    deleteConfig,
    selectionConfig,
    bulkDeleteConfig,
  }: ArrayDetailsTableProps) => {
    const { compressor = null } = useAppSelector(
      connectedInstanceSelector,
    ) as unknown as { compressor: Nullable<KeyValueCompressor> }
    const { viewFormat } = useAppSelector(selectedKeySelector)

    // Pass shared per-cell config via the table's `meta` so the static
    // column defs in `ArrayDetailsTable.config` don't need to close over
    // them and can be rebuilt only when `compressor` / `viewFormat` change.
    const meta = useMemo<ArrayTableConfig>(
      () => ({ compressor, viewFormat, deleteConfig, bulkDeleteConfig }),
      [compressor, viewFormat, deleteConfig, bulkDeleteConfig],
    )

    // The redis-ui selection checkbox column is opt-in: the plugin only sets up
    // selection state, the column itself has to be added explicitly. Hide the
    // header select-all when nothing in the current view is selectable (e.g. an
    // all-empty View range) so it isn't a dead, clickable-looking control.
    const hasSelectableRows =
      !!selectionConfig &&
      elements.some((element) => selectionConfig.getRowCanSelect(element))
    // `useRowSelectionColumn` is a plain column-def factory (it calls no hooks
    // despite the name) that returns a fresh object every render; alias it so
    // it isn't treated as a hook, and memoize on its only input so `columns`
    // below stays referentially stable across unrelated re-renders.
    const buildSelectionColumn = Table.useRowSelectionColumn
    const selectionColumn = useMemo(
      () =>
        buildSelectionColumn<ArrayDataElement>({
          disableSelectAll: !hasSelectableRows,
        }),
      [buildSelectionColumn, hasSelectableRows],
    )

    // Selection checkbox (leading) and delete column (trailing) are each
    // appended only when the consumer opts in. Depend on their presence, not
    // the config objects' identity: the cells read live popover/selection state
    // from `meta`, so rebuilding `columns` on every toggle would needlessly
    // reset table state (e.g. expanded Search context rows).
    const hasSelectionColumn = Boolean(selectionConfig)
    const hasActionsColumn = Boolean(deleteConfig)
    const columns = useMemo(() => {
      const cols = hasSelectionColumn
        ? [selectionColumn, ...arrayColumns]
        : [...arrayColumns]
      if (hasActionsColumn) cols.push(actionsColumn)
      return cols
    }, [hasSelectionColumn, hasActionsColumn, selectionColumn])

    // Use `||` rather than `??` here: the array slice clears `error` to `''`
    // after a successful request, and `''` is not nullish, so `??` would
    // surface the empty string and the table would render with no text on
    // an empty-but-successful range/scan.
    const emptyState = loading
      ? ARRAY_TABLE_LOADING_MESSAGE
      : error || ARRAY_TABLE_EMPTY_MESSAGE

    // Multi-select is opt-in. Selection keys are element indexes (`getRowId`),
    // and gaps/non-deletable rows have their checkbox disabled.
    const selectionProps = selectionConfig
      ? {
          rowSelectionMode: 'multiple' as const,
          rowSelection: selectionConfig.rowSelection,
          onRowSelectionChange: selectionConfig.onRowSelectionChange,
          getRowCanSelect: (row: Row<ArrayDataElement>) =>
            selectionConfig.getRowCanSelect(row.original),
          getRowId: (element: ArrayDataElement) => element.index,
        }
      : {}

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
          {...selectionProps}
          data-testid={`${TEST_ID}-table`}
        />
      </S.Container>
    )
  },
)

export { ArrayDetailsTable }
