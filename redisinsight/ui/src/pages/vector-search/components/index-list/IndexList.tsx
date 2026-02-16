import React, { memo, useMemo } from 'react'

import { Table } from 'uiSrc/components/base/layout/table'

import { IndexListProps } from './IndexList.types'
import { getIndexListColumns } from './IndexList.config'

export const IndexList = memo(
  ({
    data,
    loading,
    dataTestId = 'index-list',
    onQueryClick,
    actions,
  }: IndexListProps) => {
    const columns = useMemo(
      () => getIndexListColumns({ onQueryClick, actions }),
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
