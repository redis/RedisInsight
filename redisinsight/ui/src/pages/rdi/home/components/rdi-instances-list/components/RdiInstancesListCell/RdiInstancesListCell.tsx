import React from 'react'

import { CopyButton } from 'uiSrc/components/copy-button'
import { Text } from 'uiSrc/components/base/text'
import { lastConnectionFormat } from 'uiSrc/utils'
import { RdiListColumn } from 'uiSrc/constants'

import { sendCopyUrlTelemetry } from '../../methods/handlers'
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
        <CopyButton
          copy={text}
          onCopy={() => sendCopyUrlTelemetry(id)}
          aria-label="Copy URL"
        />
      )}
    </CellContainer>
  )
}

export default RdiInstancesListCell
