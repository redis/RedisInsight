import React from 'react'

import { Text } from 'uiSrc/components/base/text'
import { RiTooltip } from 'uiSrc/components'
import { IIndexesListCell } from '../../IndexesList.types'
import { formatPrefixes } from 'uiSrc/pages/vector-search/utils'

const PrefixCell: IIndexesListCell = ({ row }) => {
  const { id, prefixes } = row.original
  const formattedPrefixes = formatPrefixes(prefixes)

  return (
    <RiTooltip content={formattedPrefixes} position="bottom">
      <Text
        size="s"
        ellipsis
        data-testid={`index-prefix-${id}`}
        style={{ overflow: 'hidden' }}
      >
        {formattedPrefixes}
      </Text>
    </RiTooltip>
  )
}

export default PrefixCell
