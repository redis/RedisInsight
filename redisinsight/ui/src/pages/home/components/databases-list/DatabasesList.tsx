import React, { memo } from 'react'

import { Table } from 'uiSrc/components/base/layout/table'
import {
  handleCheckConnectToInstance,
  handleSortingChange,
} from './methods/handlers'
import BulkItemsActions from './components/BulkItemsActions/BulkItemsActions'
import { DEFAULT_SORTING } from './DatabasesList.config'
import useDatabaseListData from './hooks/useDatabaseListData'

const DatabasesList = () => {
  const {
    columns,
    visibleInstances,
    selectedInstances,
    paginationEnabled,
    rowSelection,
    emptyMessage,
    setRowSelection,
    resetRowSelection,
  } = useDatabaseListData()

  return (
    <>
      <Table
        data={visibleInstances}
        columns={columns}
        stripedRows
        rowSelectionMode="multiple"
        paginationEnabled={paginationEnabled}
        onRowClick={handleCheckConnectToInstance}
        emptyState={emptyMessage}
        onRowSelectionChange={setRowSelection}
        rowSelection={rowSelection}
        onSortingChange={handleSortingChange}
        defaultSorting={DEFAULT_SORTING}
        maxHeight="60rem" // this enables vertical scroll
      />
      <BulkItemsActions items={selectedInstances} onClose={resetRowSelection} />
    </>
  )
}

export default memo(DatabasesList)
