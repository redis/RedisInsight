import React from 'react'

import { Button } from 'uiSrc/components/base/forms/buttons'

import { IIndexesListCell } from '../../IndexesList.types'

// TODO: Replace with actual navigation/query handler
const handleQueryClick = (e: React.MouseEvent, _indexName: string) => {
  e.stopPropagation()
  // Placeholder for future implementation
}

const ActionsCell: IIndexesListCell = ({ row }) => {
  const { id, name } = row.original

  return (
    <div data-testid={`index-actions-${id}`}>
      <Button
        size="small"
        onClick={(e) => handleQueryClick(e, name)}
        data-testid={`index-query-btn-${id}`}
      >
        Query
      </Button>
      {/* TODO[DA]: Add menu actions */}
    </div>
  )
}

export default ActionsCell
