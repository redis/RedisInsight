import React from 'react'

import {
  CopyTextContainer,
  CellText,
  CopyBtnWrapper,
} from 'uiSrc/components/auto-discover'
import { RiTooltip } from 'uiSrc/components'
import { useTranslation } from 'uiSrc/i18n'
import { IMessagesListTableCell } from '../MessagesListTable.types'

const MessagesListTableCellMessage: IMessagesListTableCell = ({ row }) => {
  const { t } = useTranslation()
  const { message = '' } = row.original

  return (
    <CopyTextContainer>
      <RiTooltip title={t('pubsub.messageCell.title')} content={message}>
        <CellText>{message}</CellText>
      </RiTooltip>
      <CopyBtnWrapper
        copy={message}
        aria-label={t('pubsub.messageCell.copyAriaLabel')}
      />
    </CopyTextContainer>
  )
}

export default MessagesListTableCellMessage
