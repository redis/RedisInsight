import React from 'react'
import styled from 'styled-components'
import { RiSecondaryButton } from 'uiBase/forms'
import { RiImage } from 'uiBase/display'
import { OAuthSsoHandlerDialog } from 'uiSrc/components'

import RedisLogo from 'uiSrc/assets/img/logo_small.svg'

import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import styles from './styles.module.scss'

const LogoWrapper = styled.div`
  width: 15px;
  height: 15px;
`

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
          <LogoWrapper>
            <RiImage $size={"fullWidth"} className={styles.logo} src={RedisLogo} alt="Redis logo" />
          </LogoWrapper>
          <span>Cloud sign in</span>
        </RiSecondaryButton>
      )}
    </OAuthSsoHandlerDialog>
  )
}

export default OAuthSignInButton
