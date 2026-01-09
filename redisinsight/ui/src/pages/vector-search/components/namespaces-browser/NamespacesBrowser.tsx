import React from 'react'

import { ColumnDef, Table } from 'uiSrc/components/base/layout/table'
import { Row } from 'uiSrc/components/base/layout/flex'
import { RiIcon } from 'uiSrc/components/base/icons'
import { Text } from 'uiSrc/components/base/text'
import {
  StyledHeader,
  StyledNamespacesBrowser,
  StyledRadioGroup,
  StyledTableContainer,
  VerticalSeparator,
} from './styles'
import { RowRadioButton } from './TableRowRadioButton'
import { NampespacesBrowserTableDataProps } from './types'
import { EXAMPLE_DATA } from './data'

export const NAMESPACES_BROWSER_TABLE_COLUMNS = [
  {
    id: 'row-selection',
    size: 10,
    // We can implement customn selection via a radio button
    cell: ({ row }) => <RowRadioButton row={row} />,
    // Or we can use the built-in checkbox selection
    // cell: ({ row }) => <Table.RowSelectionButton row={row} />,
  },
  {
    accessorKey: 'namespace',
    id: 'namespace',
    cell: ({ row }) => (
      <Row gap="s">
        <RiIcon type="FolderIcon" />
        <Text>{row.original.namespace}</Text>
      </Row>
    ),
  },
] satisfies ColumnDef<NampespacesBrowserTableDataProps>[]

export const NamespacesBrowser = () => {
  const [selectedRowId, setSelectedRowId] = React.useState<string>('1')

  return (
    <StyledNamespacesBrowser grow>
      <StyledRadioGroup value={selectedRowId} onChange={setSelectedRowId}>
        <StyledTableContainer
          data={EXAMPLE_DATA}
          columns={NAMESPACES_BROWSER_TABLE_COLUMNS}
          stripedRows
        >
          <Table.Root>
            <StyledHeader gap="m" align="center">
              <RiIcon type="BillingIcon" />
              <VerticalSeparator />
              <Text size="M">Scanned 10,000 / 33,645 </Text>
            </StyledHeader>
            <Table.Body />
          </Table.Root>
        </StyledTableContainer>
      </StyledRadioGroup>
    </StyledNamespacesBrowser>
  )
}
