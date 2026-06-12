import React, { memo, useMemo } from 'react'
import { useAppSelector } from 'uiSrc/slices/hooks'

import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { selectedKeySelector } from 'uiSrc/slices/browser/keys'
import { KeyValueCompressor } from 'uiSrc/constants'
import { Nullable } from 'uiSrc/utils'

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
 * redis-ui `Table` (`@redis-ui/table`). Stays read-only in this vertical;
 * row-level edit/delete affordances ship with the Modify / Delete
 * verticals (see docs/redis-array-type-initiative.md §6 Tasks 6-7).
 */
const ArrayDetailsTable = memo(
  ({ elements, loading }: ArrayDetailsTableProps) => {
    const { compressor = null } = useAppSelector(
      connectedInstanceSelector,
    ) as unknown as { compressor: Nullable<KeyValueCompressor> }
    const { viewFormat } = useAppSelector(selectedKeySelector)

    // Pass shared per-cell config via the table's `meta` so the static
    // column defs in `ArrayDetailsTable.config` don't need to close over
    // them and can be rebuilt only when `compressor` / `viewFormat` change.
    const meta = useMemo<ArrayTableConfig>(
      () => ({ compressor, viewFormat }),
      [compressor, viewFormat],
    )

    const emptyState = loading
      ? ARRAY_TABLE_LOADING_MESSAGE
      : ARRAY_TABLE_EMPTY_MESSAGE

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
