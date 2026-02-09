import React from 'react'

import { Button } from 'uiSrc/components/base/forms/buttons'
import { IconButton } from '@redis-ui/components'

import { IIndexesListCell } from '../../IndexesList.types'
import {
  Menu,
  MenuContent,
  MenuDropdownArrow,
  MenuItem,
  MenuTrigger,
} from 'uiSrc/components/base/layout/menu'
import { MoreactionsIcon } from 'uiSrc/components/base/icons'
import { Row } from 'uiSrc/components/base/layout/flex'

// TODO: Replace with actual navigation/query handler
const handleQueryClick = (e: React.MouseEvent, _indexName: string) => {
  e.stopPropagation()
  // Placeholder for future implementation
}

const handleEditClick = (e: React.MouseEvent, _indexName: string) => {
  e.stopPropagation()
  // Placeholder for future implementation
}

const handleDeleteClick = (e: React.MouseEvent, _indexName: string) => {
  e.stopPropagation()
  // Placeholder for future implementation
}

const ActionsCell: IIndexesListCell = ({ row }) => {
  const { id, name } = row.original

  return (
    <Row
      data-testid={`index-actions-${id}`}
      gap="m"
      align="center"
      justify="center"
    >
      <Button
        size="small"
        onClick={(e) => handleQueryClick(e, name)}
        data-testid={`index-query-btn-${id}`}
      >
        Query
      </Button>
      <Menu>
        <MenuTrigger>
          <IconButton icon={MoreactionsIcon} size="L" />
        </MenuTrigger>
        <MenuContent placement="right" align="start">
          <MenuItem
            variant="primary"
            text="Edit"
            onClick={(e) => handleEditClick(e, name)}
            data-testid={`index-actions-edit-btn-${id}`}
          />
          <MenuItem
            variant="destructive"
            text="Delete"
            onClick={(e) => handleDeleteClick(e, name)}
            data-testid={`index-actions-delete-btn-${id}`}
          />
          <MenuDropdownArrow />
        </MenuContent>
      </Menu>
    </Row>
  )
}

export default ActionsCell
