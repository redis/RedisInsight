import React, { useMemo } from 'react'

import { Text } from 'uiSrc/components/base/text'
import { RiTooltip } from 'uiSrc/components'
import { IndexListRow } from '../../IndexList.types'
import { formatPrefixes } from 'uiSrc/pages/vector-search/utils'

export const PrefixCell = ({ row }: { row: IndexListRow }) => {
  const formattedPrefixes = useMemo(
    () => formatPrefixes(row.prefixes),
    [row.prefixes],
  )

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
