import React from 'react'
import { ColumnDefinition, Table } from 'uiSrc/components/base/layout/table'
import { StyledIndexAttributesList } from './IndexAttributesList.styles'

export interface IndexInfoTableData {
  attribute: string
  type: string
  weight?: string
  separator?: string
}

const tableColumns: ColumnDefinition<IndexInfoTableData>[] = [
  {
    header: 'Attribute',
    id: 'attribute',
    accessorKey: 'attribute',
  },
  {
    header: 'Type',
    id: 'type',
    accessorKey: 'type',
    enableSorting: false,
  },
  {
    header: 'Weight',
    id: 'weight',
    accessorKey: 'weight',
    enableSorting: false,
  },
  {
    header: 'Separator',
    id: 'separator',
    accessorKey: 'separator',
    enableSorting: false,
  },
]

export interface IndexAttributesListProps {
  data: IndexInfoTableData[]
}

export const IndexAttributesList = ({ data }: IndexAttributesListProps) => (
  // @ts-expect-error - styled-components typing issue: The TypeScript definitions for styled-components
  <StyledIndexAttributesList data-testid="index-attributes-list">
    <Table columns={tableColumns} data={data} />
  </StyledIndexAttributesList>
)
