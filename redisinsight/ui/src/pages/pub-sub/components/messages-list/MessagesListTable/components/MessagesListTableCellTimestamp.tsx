import React from 'react'

import { FormatedDate } from 'uiSrc/components'
import { IMessagesListTableCell } from '../MessagesListTable.types'

const MessagesListTableCellTimestamp: IMessagesListTableCell = ({ row }) => {
  const date = row.original.time * 1000

  return <FormatedDate date={date} />
}

export default MessagesListTableCellTimestamp
