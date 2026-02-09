import React from 'react'

import { Text } from 'uiSrc/components/base/text'
import { RiTooltip } from 'uiSrc/components'
import { IndexListRow } from '../../IndexesList.types'

export const NameCell = ({ row }: { row: IndexListRow }) => (
  <RiTooltip content={row.name} position="bottom">
    <Text size="s" ellipsis data-testid={`index-name-${row.id}`}>
      {row.name}
    </Text>
  </RiTooltip>
)
