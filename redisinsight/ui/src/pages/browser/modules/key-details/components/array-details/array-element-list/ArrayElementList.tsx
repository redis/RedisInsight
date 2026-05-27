import React, { memo } from 'react'

import { useArrayElementListData } from '../hooks/useArrayElementListData'
import * as S from './ArrayElementList.styles'

export interface Props {
  onRemoveKey: () => void
}

const ArrayElementList = memo(({ onRemoveKey }: Props) => {
  const {
    columns,
    currentPageData,
    tableMinWidth,
    pagination,
    setPagination,
    emptyMessage,
    total,
  } = useArrayElementListData({ onRemoveKey })

  return (
    <S.Container data-testid="array-details">
      <S.StyledTable
        columns={columns}
        data={currentPageData}
        stripedRows
        minWidth={tableMinWidth}
        paginationEnabled
        manualPagination
        totalRowCount={total}
        pagination={pagination}
        onPaginationChange={setPagination}
        emptyState={emptyMessage}
        data-testid="array-details-table"
      />
    </S.Container>
  )
})

export { ArrayElementList }
