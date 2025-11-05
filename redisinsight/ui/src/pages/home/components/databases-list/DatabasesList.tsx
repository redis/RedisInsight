import React from 'react'

import { Table } from 'uiSrc/components/base/layout/table'
import {
  handleCheckConnectToInstance,
  handleSortingChange,
} from './methods/handlers'
import BulkItemsActions from './components/BulkItemsActions/BulkItemsActions'
import {
  DEFAULT_SORTING,
  ENABLE_PAGINATION_COUNT,
} from './DatabasesList.config'
import useDatabaseListData from './hooks/useDatabaseListData'

const DatabasesList = () => {
  const {
    instances,
    columns,
    visibleInstances,
    selectedInstances,
    rowSelection,
    emptyMessage,
    setRowSelection,
  } = useDatabaseListData()

  return (
    <>
      <Table
        data={visibleInstances}
        columns={columns}
        stripedRows
        rowSelectionMode="multiple"
        paginationEnabled={instances.length > ENABLE_PAGINATION_COUNT}
        onRowClick={handleCheckConnectToInstance}
        emptyState={emptyMessage}
        onRowSelectionChange={setRowSelection}
        rowSelection={rowSelection}
        onSortingChange={handleSortingChange}
        defaultSorting={DEFAULT_SORTING}
        maxHeight="60rem" // this enables vertical scroll
      />
      <BulkItemsActions
        items={selectedInstances}
        onClose={() => {
          setRowSelection({})
        }}
      />
    </>
  )
}

export default DatabasesList
