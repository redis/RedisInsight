import React from 'react'
import { type AddRedisDatabaseStatus } from 'uiSrc/slices/interfaces'
import { ColorText, Text } from 'uiSrc/components/base/text'
import { RiTooltip } from 'uiSrc/components'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { RiIcon } from 'uiSrc/components/base/icons'

export interface ResultCellProps {
  statusAdded: AddRedisDatabaseStatus | undefined
  messageAdded: string | undefined
}

export const ResultCell = ({ statusAdded, messageAdded }: ResultCellProps) => {
  if (statusAdded === 'success') {
    return <Text>{messageAdded}</Text>
  }

  return (
    <RiTooltip position="left" title="Error" content={messageAdded}>
      <Row align="center" gap="s">
        <FlexItem>
          <RiIcon type="ToastDangerIcon" color="danger600" />
        </FlexItem>

        <FlexItem>
          <ColorText color="danger" className="flex-row euiTextAlign--center">
            Error
          </ColorText>
        </FlexItem>
      </Row>
    </RiTooltip>
  )
}
