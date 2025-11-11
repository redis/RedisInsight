import React from 'react'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import {
  AddRedisDatabaseStatus,
  InstanceRedisCloud,
} from 'uiSrc/slices/interfaces'
import { CellText } from 'uiSrc/components/auto-discover'
import { RiTooltip } from 'uiSrc/components'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { ColorText } from 'uiSrc/components/base/text'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'

export const MessageResultColumn = (): ColumnDef<InstanceRedisCloud> => {
  return {
    header: 'Result',
    id: 'messageAdded',
    accessorKey: 'messageAdded',
    enableSorting: true,
    minSize: 110,
    cell: function Message({
      row: {
        original: { statusAdded, messageAdded },
      },
    }) {
      return (
        <>
          {statusAdded === AddRedisDatabaseStatus.Success ? (
            <CellText>{messageAdded}</CellText>
          ) : (
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
          )}
        </>
      )
    },
  }
}
