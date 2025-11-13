import React from 'react'

import { RiTooltip } from 'uiSrc/components'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { CopyIcon } from 'uiSrc/components/base/icons'
import { Text } from 'uiSrc/components/base/text'
import { lastConnectionFormat } from 'uiSrc/utils'
import { RdiInstance } from 'uiSrc/slices/interfaces'

import { handleCopyUrl } from '../../methods/handlers'
import { IRdiListCell } from '../../RdiInstancesList.types'
import { CellContainer } from './RdiInstancesListCell.styles'

const RdiInstancesListCell: IRdiListCell = ({ row, field, withCopyIcon }) => {
  const instance = row.original as RdiInstance

  if (!field) {
    return null
  }

  const id = instance.id
  const value = instance[field]
  const text =
    // lastConnection is returned as a string
    field === 'lastConnection'
      ? lastConnectionFormat(value as any)
      : value?.toString()

  return (
    <CellContainer
      data-testid={`rdi-list-cell-${id}-${text}`}
      gap="s"
      align="center"
    >
      <Text>{text}</Text>
      {withCopyIcon && (
        <RiTooltip position="right" content="Copy">
          <IconButton
            size="L"
            icon={CopyIcon}
            onClick={(e) => handleCopyUrl(e, text, id)}
          />
        </RiTooltip>
      )}
    </CellContainer>
  )
}

export default RdiInstancesListCell
