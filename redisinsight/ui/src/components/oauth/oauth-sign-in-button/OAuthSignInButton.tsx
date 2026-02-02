import React from 'react'
import styled from 'styled-components'
import { OAuthSsoHandlerDialog } from 'uiSrc/components'

import RedisLogo from 'uiSrc/assets/img/logo_small.svg'

import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { SecondaryButton } from 'uiSrc/components/base/forms/buttons'
import { RiImage } from 'uiSrc/components/base/display'
import * as S from '../OAuth.styles'

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
        <S.SignInBtn
          as={SecondaryButton}
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
            <S.SignInLogo>
              <RiImage $size="fullWidth" src={RedisLogo} alt="Redis logo" />
            </S.SignInLogo>
          </LogoWrapper>
          <span>Cloud sign in</span>
        </S.SignInBtn>
      )}
    </OAuthSsoHandlerDialog>
  )
}

export default OAuthSignInButton
