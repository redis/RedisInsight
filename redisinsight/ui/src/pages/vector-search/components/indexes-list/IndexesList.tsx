import React, { memo, useMemo } from 'react'

import { Table } from 'uiSrc/components/base/layout/table'

import { IndexesListProps } from './IndexesList.types'
import { getIndexesListColumns } from './IndexesList.config'

const IndexesList = ({
  data,
  onQueryClick,
  emptyMessage,
  dataTestId = 'indexes-list',
}: IndexesListProps) => {
  const columns = useMemo(
    () => getIndexesListColumns({ onQueryClick }),
    [onQueryClick],
  )

  return (
    <Table
      data={data}
      columns={columns}
      stripedRows
      emptyState={emptyMessage}
      data-testid={dataTestId}
    />
  )
}

export default memo(IndexesList)
