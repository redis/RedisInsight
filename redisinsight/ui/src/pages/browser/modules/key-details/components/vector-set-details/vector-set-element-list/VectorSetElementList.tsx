import React, { memo } from 'react'

import { VectorSetElement } from 'uiSrc/slices/interfaces'
import { useVectorSetElementListData } from '../hooks'
import * as S from './VectorSetElementList.styles'

export interface Props {
  onRemoveKey: () => void
  onViewElement: (element: VectorSetElement) => void
  onSearchByElement: (element: VectorSetElement) => void
}

const VectorSetElementList = memo(
  ({ onRemoveKey, onViewElement, onSearchByElement }: Props) => {
    const {
      columns,
      currentPageData,
      tableMinWidth,
      pagination,
      setPagination,
      emptyMessage,
      isPaginationSupported,
      total,
    } = useVectorSetElementListData({
      onRemoveKey,
      onViewElement,
      onSearchByElement,
    })

    return (
      <S.Container data-testid="vector-set-details">
        <S.StyledTable
          columns={columns}
          data={currentPageData}
          stripedRows
          enableColumnResizing
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
  },
)

export { VectorSetElementList }
