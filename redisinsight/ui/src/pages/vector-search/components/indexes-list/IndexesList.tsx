import React, { memo, useMemo } from 'react'

import { Table } from 'uiSrc/components/base/layout/table'

import { IndexesListProps } from './IndexesList.types'
import { getIndexesListColumns } from './IndexesList.config'

export const IndexesList = memo(
  ({
    data,
    loading,
    dataTestId = 'indexes-list',
    onQueryClick,
    actions,
  }: IndexesListProps) => {
    const columns = useMemo(
      () => getIndexesListColumns({ onQueryClick, actions }),
      [onQueryClick, actions],
    )

    const hasIndexes = useMemo(() => !!data?.length, [data])

    const emptyMessage = useMemo(() => {
      if (loading) {
        return 'Loading...'
      }
      if (!hasIndexes) {
        return 'No indexes found'
      }
      return 'No results found'
    }, [loading, hasIndexes])

    return (
      <Table
        data={data}
        columns={columns}
        stripedRows
        emptyState={emptyMessage}
        data-testid={dataTestId}
      />
    )
  },
)
