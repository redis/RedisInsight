import React from 'react'
import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { OAuthSsoHandlerDialog } from 'uiSrc/components'
import { RiLink } from 'uiSrc/components/base/display'

export interface Props {
  url: string
  text: string
  source: OAuthSocialSource
}

const CloudLink = (props: Props) => {
  const { url, text, source = OAuthSocialSource.Tutorials } = props
  return (
    <OAuthSsoHandlerDialog>
      {(ssoCloudHandlerClick) => (
        <RiLink
          color="text"
          onClick={(e) => {
            ssoCloudHandlerClick(e, {
              source,
              action: OAuthSocialAction.Create,
            })
          }}
          target="_blank"
          href={url}
          data-testid="guide-free-database-link"
        >
          {text}
        </RiLink>
      )}
    </OAuthSsoHandlerDialog>
  )
}

export default CloudLink
