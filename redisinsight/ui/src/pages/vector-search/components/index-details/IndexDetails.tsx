import React from 'react'
import { Table } from 'uiSrc/components/base/layout/table'
import { useIndexDetailsColumns } from './IndexDetails.config'
import * as S from './IndexDetails.styles'
import {
  IndexDetailsMode,
  IndexDetailsProps,
  IndexField,
} from './IndexDetails.types'

export const IndexDetails = ({
  fields,
  mode = IndexDetailsMode.Editable,
  showBorder = false,
  rowSelection,
  onRowSelectionChange,
  onFieldEdit,
}: IndexDetailsProps) => {
  const isEditable = mode === IndexDetailsMode.Editable
  const columns = useIndexDetailsColumns({ mode, onFieldEdit })

  return (
    <S.IndexDetailsContainer
      as="div"
      $showBorder={showBorder}
      data-testid="index-details-container"
    >
      <Table
        columns={columns}
        data={fields}
        getRowId={(row: IndexField) => row.id}
        rowSelectionMode={isEditable ? 'multiple' : undefined}
        rowSelection={rowSelection}
        onRowSelectionChange={onRowSelectionChange}
        data-testid="index-details-table"
      />
    </S.IndexDetailsContainer>
  )
}
