import React from 'react'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import {
  AddRedisDatabaseStatus,
  InstanceRedisCluster,
} from 'uiSrc/slices/interfaces'
import { ColorText, Text } from 'uiSrc/components/base/text'
import { RiTooltip } from 'uiSrc/components'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { RiIcon } from 'uiSrc/components/base/icons'

export const ResultColumn = (): ColumnDef<InstanceRedisCluster> => {
  return {
    header: 'Result',
    id: 'messageAdded',
    accessorKey: 'messageAdded',
    enableSorting: true,
    cell: function Message({
      row: {
        original: { statusAdded, messageAdded },
      },
    }) {
      return (
        <>
          {statusAdded === AddRedisDatabaseStatus.Success ? (
            <Text>{messageAdded}</Text>
          ) : (
            <RiTooltip position="left" title="Error" content={messageAdded}>
              <Row align="center" gap="s">
                <FlexItem>
                  <RiIcon type="ToastDangerIcon" color="danger600" />
                </FlexItem>

                <FlexItem>
                  <ColorText
                    color="danger"
                    className="flex-row euiTextAlign--center"
                  >
                    Error
                  </ColorText>
                </FlexItem>
              </Row>
            </RiTooltip>
          )}
        </>
      )
    },
  }
}
