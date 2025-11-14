import React from 'react'

import { RiTooltip } from 'uiSrc/components'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { CopyIcon } from 'uiSrc/components/base/icons'
import { Text } from 'uiSrc/components/base/text'
import { lastConnectionFormat } from 'uiSrc/utils'
import { RdiListColumn } from 'uiSrc/constants'

import { handleCopyUrl } from '../../methods/handlers'
import { IRdiListCell } from '../../RdiInstancesList.types'
import { CellContainer } from './RdiInstancesListCell.styles'

const fieldCopyIcon: Record<string, boolean> = {
  [RdiListColumn.Url]: true,
}

const fieldFormatters: Record<string, (v: any) => string> = {
  [RdiListColumn.LastConnection]: lastConnectionFormat,
}

const RdiInstancesListCell: IRdiListCell = ({ row, column }) => {
  const item = row.original
  const id = item.id
  const field = column.id as keyof typeof item
  const value = item[field]

  if (!field || !value) {
    return null
  }

  const text = fieldFormatters[field]?.(value) ?? value?.toString()
  const withCopyIcon = fieldCopyIcon[field]

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
