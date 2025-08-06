import React from 'react'
import { RiSecondaryButton } from 'uiBase/forms'
import { RiImage } from 'uiBase/display'
import { OAuthSsoHandlerDialog } from 'uiSrc/components'

import RedisLogo from 'uiSrc/assets/img/logo_small.svg'

import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import styles from './styles.module.scss'

export interface Props {
  source: OAuthSocialSource
}

const OAuthSignInButton = (props: Props) => {
  const { source } = props

  return (
    <OAuthSsoHandlerDialog>
      {(socialCloudHandlerClick) => (
        <RiSecondaryButton
          className={styles.btn}
          size="s"
          onClick={(e: React.MouseEvent) =>
            socialCloudHandlerClick(e, {
              source,
              action: OAuthSocialAction.SignIn,
            })
          }
          data-testid="cloud-sign-in-btn"
        >
          <RiImage className={styles.logo} src={RedisLogo} alt="Redis logo" />
          <span>Cloud sign in</span>
        </RiSecondaryButton>
      )}
    </OAuthSsoHandlerDialog>
  )
}

export default OAuthSignInButton
