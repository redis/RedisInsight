import React from 'react'
import { formatLongName } from 'uiSrc/utils'
import { CellText } from 'uiSrc/components/auto-discover'

import * as S from '../../RedisCluster.styles'

export interface DatabaseCellProps {
  name: string
}

export const DatabaseCell = ({ name }: DatabaseCellProps) => {
  const cellContent = (name || '')
    .substring(0, 200)
    .replace(/\s\s/g, '\u00a0\u00a0')

  return (
    <div role="presentation" data-testid={`db_name_${name}`}>
      <S.ColumnNameTooltip
        position="bottom"
        title="Database"
        anchorClassName="truncateText"
        content={formatLongName(name || '')}
      >
        <CellText>{cellContent}</CellText>
      </S.ColumnNameTooltip>
    </div>
  )
}
