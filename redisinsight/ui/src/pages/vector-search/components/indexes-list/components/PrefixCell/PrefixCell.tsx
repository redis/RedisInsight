import React from 'react'

import { Text } from 'uiSrc/components/base/text'
import { RiTooltip } from 'uiSrc/components'
import { IndexListRow } from '../../IndexesList.types'
import { formatPrefixes } from 'uiSrc/pages/vector-search/utils'

export const PrefixCell = ({ row }: { row: IndexListRow }) => {
  const formattedPrefixes = formatPrefixes(row.prefixes)

  return (
    <RiTooltip content={formattedPrefixes} position="bottom">
      <Text
        size="s"
        ellipsis
        data-testid={`index-prefix-${row.id}`}
        style={{ overflow: 'hidden' }}
      >
        {formattedPrefixes}
      </Text>
    </RiTooltip>
  )
}
