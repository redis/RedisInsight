import React from 'react'
import { useDispatch } from 'react-redux'
import { OAuthAgreement } from 'uiSrc/components/oauth/shared'

import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { setSSOFlow } from 'uiSrc/slices/instances/cloud'
import { setOAuthCloudSource } from 'uiSrc/slices/oauth/cloud'
import OAuthForm from 'uiSrc/components/oauth/shared/oauth-form'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'
import styles from './styles.module.scss'

const WelcomeAiAssistant = () => {
  const dispatch = useDispatch()

  const handleSsoClick = (accountOption: string) => {
    dispatch(setSSOFlow(OAuthSocialAction.SignIn))
    dispatch(setOAuthCloudSource(OAuthSocialSource.AiChat))

    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_SIGN_IN_SOCIAL_ACCOUNT_SELECTED,
      eventData: {
        accountOption,
        action: OAuthSocialAction.SignIn,
        source: OAuthSocialSource.AiChat,
      },
    })
  }

  return (
    <div className={styles.wrapper} data-testid="copilot-welcome">
      <div className={styles.container}>
        <OAuthForm action={OAuthSocialAction.SignIn} onClick={handleSsoClick}>
          {(form: React.ReactNode) => (
            <>
              <Title size="L" variant="semiBold" color="primary">
                Welcome to Redis Copilot
              </Title>
              <Spacer size="s" />
              <Text size="s" color="secondary">
                Learn about Redis and explore your data, in a conversational
                manner.
              </Text>
              <Spacer size="s" />
              <Text size="s" color="secondary">
                Build faster with Redis Copilot.
              </Text>
              <Spacer size="xxl" />
              <Title size="XS" color="secondary">
                Sign in to get started
              </Title>

              <Spacer size="l" />
              {form}
              <Spacer />

              <div className={styles.agreement}>
                <OAuthAgreement />
              </div>
            </>
          )}
        </OAuthForm>
      </div>
    </div>
  )
}

export default WelcomeAiAssistant
