import React from 'react'
import { TFunction } from 'i18next'

import { Text } from 'uiSrc/components/base/text'
import { StyledUrlItem, StyledUrlList } from './HostInfoTooltipContent.styles'

const supportedUrls = [
  'redis://[[username]:[password]]@host:port',
  'rediss://[[username]:[password]]@host:port',
  'host:port',
]

export const HostInfoTooltipContent = ({
  includeAutofillInfo,
  t,
}: {
  includeAutofillInfo: boolean
  t: TFunction
}) => (
  <>
    {includeAutofillInfo && (
      <Text variant="semiBold">{t('common.connectionInfo.autofill')}</Text>
    )}
    <Text variant="semiBold">{t('common.connectionInfo.supportedUrls')}</Text>
    <StyledUrlList>
      {supportedUrls.map((url) => (
        <StyledUrlItem key={url}>{url}</StyledUrlItem>
      ))}
    </StyledUrlList>
  </>
)
