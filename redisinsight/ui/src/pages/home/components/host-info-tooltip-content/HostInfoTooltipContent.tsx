import React from 'react'

import { Text } from 'uiSrc/components/base/text'
import { StyledUrlItem, StyledUrlList } from './HostInfoTooltipContent.styles'

const supportedUrls = [
  'redis://[[username]:[password]]@host:port',
  'rediss://[[username]:[password]]@host:port',
  'host:port',
]

export const HostInfoTooltipContent = ({
  includeAutofillInfo,
}: {
  includeAutofillInfo: boolean
}) => (
  <>
    {includeAutofillInfo && (
      <Text variant="semiBold">
        Pasting a connection URL auto fills the database details.
      </Text>
    )}
    <Text variant="semiBold">The following connection URLs are supported:</Text>
    <StyledUrlList>
      {supportedUrls.map((url) => (
        <StyledUrlItem key={url}>{url}</StyledUrlItem>
      ))}
    </StyledUrlList>
  </>
)
