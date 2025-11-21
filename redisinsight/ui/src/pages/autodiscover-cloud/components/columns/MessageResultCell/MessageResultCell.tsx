import React from 'react'

import { AddRedisDatabaseStatus } from 'uiSrc/slices/interfaces'
import { CellText } from 'uiSrc/components/auto-discover'
import { RiTooltip } from 'uiSrc/components'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { ColorText } from 'uiSrc/components/base/text'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { CellContext } from 'uiSrc/components/base/layout/table'
import { InstanceRedisCloud } from 'uiSrc/slices/interfaces'

import type { MessageResultCellRendererProps } from './MessageResultCell.types'

export const MessageResultCellRenderer = ({
  statusAdded,
  messageAdded = '',
}: MessageResultCellRendererProps) => {
  if (!statusAdded) {
    return <CellText>-</CellText>
  }

  if (statusAdded === AddRedisDatabaseStatus.Success) {
    return <CellText>{messageAdded}</CellText>
  }

  return (
    <RiTooltip
      position="left"
      title="Error"
      content={messageAdded}
      anchorClassName="truncateText"
    >
      <Row align="center" gap="s">
        <FlexItem>
          <RiIcon type="ToastDangerIcon" color="danger600" />
        </FlexItem>

        <FlexItem>
          <ColorText color="danger" className="flex-row" size="S">
            Error
          </ColorText>
        </FlexItem>
      </Row>
    </RiTooltip>
  )
}

export const MessageResultCell = ({
  row,
}: CellContext<InstanceRedisCloud, unknown>) => {
  const { statusAdded, messageAdded } = row.original
  return (
    <MessageResultCellRenderer
      statusAdded={statusAdded}
      messageAdded={messageAdded}
    />
  )
}

