import React, { memo } from 'react'

import { Table } from 'uiSrc/components/base/layout/table'

import useRdiInstancesListData from './hooks/useRdiInstancesListData'
import {
  handleCheckConnectToRdiInstance,
  handlePaginationChange,
  handleSortingChange,
  getDefaultPagination,
} from './methods/handlers'
import { getDefaultSorting } from './methods/sortingAdapters'
import BulkItemsActions from './components/BulkItemsActions/BulkItemsActions'

const RdiInstancesList = () => {
  const {
    columns,
    visibleInstances,
    selectedInstances,
    paginationEnabled,
    rowSelection,
    emptyMessage,
    setRowSelection,
    resetRowSelection,
  } = useRdiInstancesListData()

  return (
    <div data-testid="rdi-instance-list">
      <Table
        data={visibleInstances}
        columns={columns}
        stripedRows
        rowSelectionMode="multiple"
        paginationEnabled={paginationEnabled}
        onRowClick={handleCheckConnectToRdiInstance}
        emptyState={emptyMessage}
        onRowSelectionChange={setRowSelection}
        rowSelection={rowSelection}
        onSortingChange={handleSortingChange}
        defaultSorting={getDefaultSorting()}
        onPaginationChange={handlePaginationChange}
        defaultPagination={getDefaultPagination()}
        maxHeight="60rem"
      />
      <BulkItemsActions items={selectedInstances} onClose={resetRowSelection} />
    </div>
  )
}

export default memo(RdiInstancesList)
