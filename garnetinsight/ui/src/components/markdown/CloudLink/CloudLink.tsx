import React from 'react'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { Link } from 'uiSrc/components/base/link/Link'

export interface Props {
  url: string
  text: string
  source: OAuthSocialSource
}

const CloudLink = (props: Props) => {
  const { url, text } = props
  return (
    <Link
      color="text"
      target="_blank"
      href={url}
      data-testid="guide-free-database-link"
    >
      {text}
    </Link>
  )
}

export default CloudLink
