import React, { memo } from 'react'

import useVectorSetElementListData from './hooks/useVectorSetElementListData'
import * as S from './VectorSetElementList.styles'

export interface Props {
  onRemoveKey: () => void
}

const VectorSetElementList = memo(({ onRemoveKey }: Props) => {
  const {
    columns,
    currentPageData,
    tableMinWidth,
    pagination,
    setPagination,
    emptyMessage,
    isPaginationSupported,
    total,
  } = useVectorSetElementListData({ onRemoveKey })

  return (
    <S.Container data-testid="vector-set-details">
      <S.StyledTable
        columns={columns}
        data={currentPageData}
        stripedRows
        minWidth={tableMinWidth}
        paginationEnabled={isPaginationSupported}
        manualPagination={isPaginationSupported}
        totalRowCount={isPaginationSupported ? total : undefined}
        pagination={pagination}
        onPaginationChange={setPagination}
        emptyState={emptyMessage}
        data-testid="vector-set-details-table"
      />
    </S.Container>
  )
})

export { VectorSetElementList }
