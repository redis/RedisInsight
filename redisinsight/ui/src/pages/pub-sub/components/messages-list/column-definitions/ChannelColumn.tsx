import React from 'react'

import { IMessage } from 'apiSrc/modules/pub-sub/interfaces/message.interface'
import { ColumnDef } from 'uiSrc/components/base/layout/table'
import { Text } from 'uiSrc/components/base/text'

export const ChannelColumn = (): ColumnDef<IMessage> => {
  return {
    id: 'channel',
    header: `Channel`,
    accessorKey: 'channel',
    size: 30,
    cell: ({ getValue }) => {
      const channel = getValue() as number

      return <Text>{channel}</Text>
    },
  }
}
