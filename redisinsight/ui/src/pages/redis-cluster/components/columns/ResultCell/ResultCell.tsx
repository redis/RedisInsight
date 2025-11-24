import React from 'react'
import { InstanceRedisCluster } from 'uiSrc/slices/interfaces'
import { ColorText, Text } from 'uiSrc/components/base/text'
import { RiTooltip } from 'uiSrc/components'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { RiIcon } from 'uiSrc/components/base/icons'
import { CellContext } from 'uiSrc/components/base/layout/table'

export const ResultCell = ({
  row,
}: CellContext<InstanceRedisCluster, unknown>) => {
  const { statusAdded, messageAdded } = row.original
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
