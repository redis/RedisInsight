import React from 'react'
import { Props as ExternalLinkProps } from 'uiSrc/components/base/external-link/ExternalLink'
import { ExternalLink } from 'uiSrc/components'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'

const ChatExternalLink = (props: ExternalLinkProps) => {
  const { href } = props
  return (
    <ExternalLink
      display="inline"
      allowWrap={true}
      {...props}
      data-testid="chat-external-link"
      href={getUtmExternalLink(href || EXTERNAL_LINKS.redisIo, {
        campaign: 'ai_assistant',
      })}
    />
  )
}

export default React.memo(ChatExternalLink)
