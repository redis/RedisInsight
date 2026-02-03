import React from 'react'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { Link, LinkProps } from 'uiSrc/components/base/link/Link'

const ChatExternalLink = (props: LinkProps) => {
  const { href } = props
  return (
    <Link
      external
      variant="inline"
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
