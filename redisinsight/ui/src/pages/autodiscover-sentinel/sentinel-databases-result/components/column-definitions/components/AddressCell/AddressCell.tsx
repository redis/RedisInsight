import React from 'react'
import {
  CopyTextContainer,
  CopyPublicEndpointText,
  CopyBtnWrapper,
} from 'uiSrc/components/auto-discover'
import { useTranslation } from 'uiSrc/i18n'

import type { AddressCellProps } from './AddressCell.types'

export const AddressCell = ({ host = '', port = '' }: AddressCellProps) => {
  const { t } = useTranslation()

  if (!host || !port) {
    return null
  }

  const text = `${host}:${port}`
  return (
    <CopyTextContainer>
      <CopyPublicEndpointText className="copyHostPortText">
        {text}
      </CopyPublicEndpointText>
      <CopyBtnWrapper
        copy={text}
        aria-label={t('autodiscover.sentinel.cell.copyAddressAria')}
        successLabel=""
      />
    </CopyTextContainer>
  )
}
