import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import { RiTable, ColumnDefinition } from 'uiBase/layout'

export interface Props {
  query: string
  result: any
}

const noResultMessage = 'No results'

const TableView = React.memo(({ result, query }: Props) => {
  const [columns, setColumns] = useState<ColumnDefinition<any>[]>([])

  useEffect(() => {
    if (!result?.length) {
      return
    }

    const newColumns = Object.keys(result[0]).map((item) => ({
      header: item,
      id: item,
      accessorKey: item,
      enableSorting: true,
    }))

    setColumns(newColumns)
  }, [result, query])

  return (
    <div className={cx('queryResultsContainer', 'container')}>
      <RiTable data={result ?? []} columns={columns} paginationEnabled />
      {!result?.length && <span>{noResultMessage}</span>}
    </div>
  )
})

export default TableView
