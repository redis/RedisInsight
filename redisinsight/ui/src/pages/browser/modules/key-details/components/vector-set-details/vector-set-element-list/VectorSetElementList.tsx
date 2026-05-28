import React, { memo } from 'react'

import { useVectorSetElementListData } from '../hooks'
import { vectorSetColumns } from './VectorSetElementList.config'
import { VectorSetActionsConfig } from './VectorSetElementList.types'
import * as S from './VectorSetElementList.styles'

export interface Props {
  actionsConfig: VectorSetActionsConfig
}

const VectorSetElementList = memo(({ actionsConfig }: Props) => {
  const {
    meta,
    currentPageData,
    tableMinWidth,
    pagination,
    setPagination,
    emptyMessage,
    isPaginationSupported,
    total,
  } = useVectorSetElementListData({ actionsConfig })

  return (
    <S.Container data-testid="vector-set-details">
      <S.StyledTable
        columns={vectorSetColumns}
        data={currentPageData}
        meta={meta}
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
