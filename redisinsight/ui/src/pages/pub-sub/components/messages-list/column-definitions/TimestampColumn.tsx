import { IMessage } from 'apiSrc/modules/pub-sub/interfaces/message.interface'
import React from 'react'

import { FormatedDate } from 'uiSrc/components'
import { ColumnDef } from 'uiSrc/components/base/layout/table'

export const TimestampColumn = (): ColumnDef<IMessage> => {
  return {
    id: 'time',
    header: 'Timestamp',
    accessorKey: 'time',
    size: 40,
    cell: ({ getValue }) => {
      const date = (getValue() as number) * 1000

      return <FormatedDate date={date} />
    },
  }
}
