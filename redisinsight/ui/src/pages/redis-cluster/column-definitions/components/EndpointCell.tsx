import React from 'react'
import { RiTooltip } from 'uiSrc/components'
import { formatLongName } from 'uiSrc/utils'
import {
  CopyPublicEndpointText,
  CopyTextContainer,
  CopyBtnWrapper,
} from 'uiSrc/components/auto-discover'
import { useTranslation } from 'uiSrc/i18n'

export interface EndpointCellProps {
  dnsName: string
  port: number
}

export const EndpointCell = ({ dnsName, port }: EndpointCellProps) => {
  const { t } = useTranslation()
  if (!dnsName) {
    return null
  }
  const text = `${dnsName}:${port}`

  return (
    <CopyTextContainer>
      <RiTooltip
        position="bottom"
        title={t('cluster.column.endpoint')}
        content={formatLongName(text)}
      >
        <CopyPublicEndpointText>{text}</CopyPublicEndpointText>
      </RiTooltip>

      <CopyBtnWrapper
        copy={text}
        aria-label={t('cluster.endpoint.copyAriaLabel')}
        successLabel=""
      />
    </CopyTextContainer>
  )
}
