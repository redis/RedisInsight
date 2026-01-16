import React from 'react'

import {
  CopyTextContainer,
  CellText,
  CopyBtnWrapper,
} from 'uiSrc/components/auto-discover'
import { RiTooltip } from 'uiSrc/components'
import { IMessagesListTableCell } from '../MessagesListTable.types'

const MessagesListTableCellMessage: IMessagesListTableCell = ({ row }) => {
  const { message = '' } = row.original

  return (
    <CopyTextContainer>
      <RiTooltip title="Message" content={message}>
        <CellText>{message}</CellText>
      </RiTooltip>
      <CopyBtnWrapper copy={message} aria-label="Copy message" />
    </CopyTextContainer>
  )
}

export default MessagesListTableCellMessage
