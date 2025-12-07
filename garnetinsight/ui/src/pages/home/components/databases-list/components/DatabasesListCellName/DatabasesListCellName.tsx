import React from 'react'

import { IDatabaseListCell } from '../../DatabasesList.types'
import { RiTooltip } from 'uiSrc/components'
import { replaceSpaces, formatLongName, getDbIndex } from 'uiSrc/utils'
import DbStatus from 'uiSrc/pages/home/components/db-status'
import { Text } from 'uiSrc/components/base/text'

import { StyledCellNameWrapper } from './DatabasesListCellName.styles'

const DatabasesListCellName: IDatabaseListCell = ({ row }) => {
  const instance = row.original
  const {
    id,
    db,
    name = '',
    new: newStatus = false,
    lastConnection,
    createdAt,
    cloudDetails,
  } = instance
  const cellContent = replaceSpaces(name.substring(0, 200))

  return (
    <StyledCellNameWrapper role="presentation" align="center" gap="xs">
      <div>
        <DbStatus
          id={id}
          isNew={newStatus}
          lastConnection={lastConnection}
          createdAt={createdAt}
          isFree={cloudDetails?.free}
        />
      </div>

      <RiTooltip
        position="bottom"
        title="Database Alias"
        content={`${formatLongName(name)} ${getDbIndex(db)}`}
      >
        <Text
          data-testid={`instance-name-${id}`}
          color="primary"
          ellipsis
          style={{
            overflow: 'hidden',
          }}
        >
          {cellContent}
          {` ${getDbIndex(db)}`}
        </Text>
      </RiTooltip>
    </StyledCellNameWrapper>
  )
}

export default DatabasesListCellName
