import React from 'react'

import { Text } from 'uiSrc/components/base/text'
import { RiTooltip } from 'uiSrc/components'
import { IIndexesListCell } from '../../IndexesList.types'

const NameCell: IIndexesListCell = ({ row }) => {
  const { id, name } = row.original

  return (
    <RiTooltip content={name} position="bottom">
      <Text size="s" ellipsis data-testid={`index-name-${id}`}>
        {name}
      </Text>
    </RiTooltip>
  )
}

export default NameCell
