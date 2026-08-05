import React, { memo, useMemo } from 'react'

import { useTranslation } from 'uiSrc/i18n'
import { Table } from 'uiSrc/components/base/layout/table'

import { IndexListProps } from './IndexList.types'
import { getIndexListColumns } from './IndexList.config'

export const IndexList = memo(
  ({
    data,
    loading,
    hasSearch,
    dataTestId = 'index-list',
    onQueryClick,
    actions,
  }: IndexListProps) => {
    const { t } = useTranslation()
    const columns = useMemo(
      () => getIndexListColumns({ onQueryClick, actions }),
      [onQueryClick, actions],
    )

    const emptyMessage = useMemo(() => {
      if (loading) {
        return t('vectorSearch.list.empty.loading')
      }
      if (hasSearch) {
        return t('vectorSearch.list.empty.noResults')
      }
      return t('vectorSearch.list.empty.noIndexes')
    }, [loading, hasSearch, t])

    return (
      <Table
        data={data}
        columns={columns}
        stripedRows
        enableColumnResizing
        minWidth="920px"
        emptyState={emptyMessage}
        data-testid={dataTestId}
      />
    )
  },
)
