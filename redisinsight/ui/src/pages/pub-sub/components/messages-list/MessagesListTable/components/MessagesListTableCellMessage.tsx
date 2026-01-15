import React from 'react'

import {
  CopyTextContainer,
  CellText,
  CopyBtnWrapper,
} from 'uiSrc/components/auto-discover'
import { formatLongName } from 'uiSrc/utils'
import { RiTooltip } from 'uiSrc/components'
import { IMessagesListTableCell } from '../MessagesListTable.types'

const MessagesListTableCellMessage: IMessagesListTableCell = ({ row }) => {
  const { message = '' } = row.original

  return (
    <CopyTextContainer>
      <RiTooltip title="Message" content={formatLongName(message)}>
        <CellText>{message}</CellText>
      </RiTooltip>
      <CopyBtnWrapper copy={message} aria-label="Copy message" />
    </CopyTextContainer>
  )
}

export default MessagesListTableCellMessage
