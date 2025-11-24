import React from 'react'
import styled from 'styled-components'
import { RiTooltip } from 'uiSrc/components'
import { formatLongName } from 'uiSrc/utils'
import { CellText } from 'uiSrc/components/auto-discover'
import { CellContext } from 'uiSrc/components/base/layout/table'
import { InstanceRedisCluster } from 'uiSrc/slices/interfaces'

const StyledTooltip = styled(RiTooltip)`
  max-width: 370px;
`

export const DatabaseCell = ({
  row,
}: CellContext<InstanceRedisCluster, unknown>) => {
  const { name } = row.original
  const cellContent = (name || '')
    .substring(0, 200)
    .replace(/\s\s/g, '\u00a0\u00a0')

  return (
    <div role="presentation" data-testid={`db_name_${name}`}>
      <StyledTooltip
        position="bottom"
        title="Database"
        anchorClassName="truncateText"
        content={formatLongName(name || '').repeat(10)}
      >
        <CellText>{cellContent}</CellText>
      </StyledTooltip>
    </div>
  )
}
