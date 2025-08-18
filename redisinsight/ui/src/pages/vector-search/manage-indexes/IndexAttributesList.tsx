import React from 'react'
import { RiIcon } from 'uiBase/icons'
import { IndexInfoDto } from 'apiSrc/modules/browser/redisearch/dto'
import {
  StyledIndexAttributesList,
  StyledIndexAttributesTable,
  StyledIndexSummaryInfo,
} from './IndexAttributesList.styles'
import { ColumnDefinition, RiTable } from 'uiBase/layout'
import { RiLoader } from 'uiBase/display'

export interface IndexInfoTableData {
  identifier: string
  attribute: string
  type: string
  weight?: string
  noindex?: boolean
}

const tableColumns: ColumnDefinition<IndexInfoTableData>[] = [
  {
    header: 'Identifier',
    id: 'identifier',
    accessorKey: 'identifier',
  },
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
    header: 'Noindex',
    id: 'noindex',
    accessorKey: 'noindex',
    enableSorting: false,
    cell: ({ row }) => (
      <RiIcon
        type={row.original.noindex ? 'CheckBoldIcon' : 'CancelIcon'}
        color={row.original.noindex ? 'primary400' : 'danger500'}
        data-testid="index-attributes-list--noindex-icon"
        data-attribute={row.original.noindex}
      />
    ),
  },
]

export interface IndexAttributesListProps {
  indexInfo: IndexInfoDto | undefined
}

export const IndexAttributesList = ({
  indexInfo,
}: IndexAttributesListProps) => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { num_docs, max_doc_id, num_records, num_terms } = indexInfo || {}

  if (!indexInfo) {
    return <RiLoader data-testid="index-attributes-list--loader" />
  }

  return (
    <StyledIndexAttributesList data-testid="index-attributes-list" as="div">
      <StyledIndexAttributesTable
        as="div"
        data-testid="index-attributes-list--table"
      >
        <RiTable
          columns={tableColumns}
          data={parseIndexAttributes(indexInfo)}
        />
      </StyledIndexAttributesTable>

      <StyledIndexSummaryInfo>
        <p data-testid="index-attributes-list--summary-info">
          Number of docs: {num_docs} (max {max_doc_id}) | Number of records:{' '}
          {num_records} | Number of terms: {num_terms}
        </p>
      </StyledIndexSummaryInfo>
    </StyledIndexAttributesList>
  )
}

const parseIndexAttributes = (indexInfo: IndexInfoDto): IndexInfoTableData[] =>
  indexInfo.attributes.map((field) => ({
    identifier: field.identifier,
    attribute: field.attribute,
    type: field.type,
    weight: field.WEIGHT,
    noindex: field.NOINDEX ?? true,
  }))
