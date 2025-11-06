import React from 'react'

import { IDatabaseListCell } from '../../DatabasesList.types'
import { TagsCell } from '../../../tags-cell/TagsCell'

const DatabasesListCellTags: IDatabaseListCell = ({ row }) => {
  const instance = row.original
  const { tags = [] } = instance

  return <TagsCell tags={tags} />
}

export default DatabasesListCellTags
