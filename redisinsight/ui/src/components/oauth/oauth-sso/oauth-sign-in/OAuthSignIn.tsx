import React from 'react'
import { useDispatch } from 'react-redux'
import { OAuthAdvantages, OAuthAgreement } from 'uiSrc/components/oauth/shared'
import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { setSSOFlow } from 'uiSrc/slices/instances/cloud'
import { Nullable } from 'uiSrc/utils'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'
import OAuthForm from '../../shared/oauth-form/OAuthForm'
import * as S from '../../OAuth.styles'
import { StyledAdvantagesContainerAbsolute } from '../../shared/styles'

export interface Props {
  source?: Nullable<OAuthSocialSource>
  action?: OAuthSocialAction
}

const OAuthSignIn = (props: Props) => {
  const { source, action = OAuthSocialAction.SignIn } = props

  const dispatch = useDispatch()

  const handleSocialButtonClick = (accountOption: string) => {
    dispatch(setSSOFlow(action))
    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_SIGN_IN_SOCIAL_ACCOUNT_SELECTED,
      eventData: {
        accountOption,
        action,
        source,
      },
    })
  }

  return (
    <S.SsoContainer data-testid="oauth-container-signIn">
      <Row>
        <S.SsoAdvantagesContainer as={FlexItem} grow>
          <StyledAdvantagesContainerAbsolute>
            <OAuthAdvantages />
          </StyledAdvantagesContainerAbsolute>
        </S.SsoAdvantagesContainer>
        <S.SsoSocialContainer as={FlexItem} grow>
          <OAuthForm onClick={handleSocialButtonClick} action={action}>
            {(form: React.ReactNode) => (
              <>
                <S.SsoSubTitle as={Text}>Get started with</S.SsoSubTitle>
                <S.SsoTitle as={Title} size="XL">
                  Redis Cloud account
                </S.SsoTitle>
                <S.SsoSocialButtons>{form}</S.SsoSocialButtons>
                <OAuthAgreement />
              </>
            )}
          </OAuthForm>
        </S.SsoSocialContainer>
      </Row>
    </S.SsoContainer>
  )
}

export default OAuthSignIn
