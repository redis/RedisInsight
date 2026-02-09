import React, { memo } from 'react'

import { Table } from 'uiSrc/components/base/layout/table'

import { IndexesListProps } from './IndexesList.types'
import { INDEXES_LIST_COLUMNS } from './IndexesList.config'

const IndexesList = ({
  data,
  emptyMessage,
  dataTestId = 'indexes-list',
}: IndexesListProps) => (
  <Table
    data={data}
    columns={INDEXES_LIST_COLUMNS}
    stripedRows
    emptyState={emptyMessage}
    data-testid={dataTestId}
  />
)

export default memo(IndexesList)
