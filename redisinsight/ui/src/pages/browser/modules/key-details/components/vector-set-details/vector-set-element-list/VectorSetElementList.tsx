import React, { memo, useMemo } from 'react'
import { ParseKeys } from 'i18next'

import { useTranslation } from 'uiSrc/i18n'
import { useVectorSetElementListData } from '../hooks'
import {
  TABLE_MIN_WIDTH,
  vectorSetColumns,
} from './VectorSetElementList.config'
import { VectorSetActionsConfig } from './VectorSetElementList.types'
import * as S from './VectorSetElementList.styles'

export interface Props {
  actionsConfig: VectorSetActionsConfig
}

const VectorSetElementList = memo(({ actionsConfig }: Props) => {
  const { t } = useTranslation()
  const {
    meta,
    currentPageData,
    pagination,
    setPagination,
    emptyMessage,
    isPaginationSupported,
    total,
  } = useVectorSetElementListData({ actionsConfig })

  const columns = useMemo(
    () =>
      vectorSetColumns.map((col) =>
        typeof col.header === 'string' && col.header
          ? { ...col, header: t(col.header as ParseKeys) }
          : col,
      ),
    [t],
  )

  return (
    <S.Container data-testid="vector-set-details">
      <S.StyledTable
        columns={columns}
        data={currentPageData}
        meta={meta}
        stripedRows
        minWidth={TABLE_MIN_WIDTH}
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
