import React from 'react'
import { useDispatch } from 'react-redux'
import { RiFlexItem, RiRow } from 'uiBase/layout'
import { RiTitle, RiText } from 'uiBase/text'
import { OAuthAdvantages, OAuthAgreement } from 'uiSrc/components/oauth/shared'
import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { setSSOFlow } from 'uiSrc/slices/instances/cloud'
import { Nullable } from 'uiSrc/utils'

import OAuthForm from '../../shared/oauth-form/OAuthForm'
import styles from './styles.module.scss'

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
    <div className={styles.container} data-testid="oauth-container-signIn">
      <RiRow>
        <RiFlexItem grow className={styles.advantagesContainer}>
          <OAuthAdvantages />
        </RiFlexItem>
        <RiFlexItem grow className={styles.socialContainer}>
          <OAuthForm
            onClick={handleSocialButtonClick}
            action={action}
            className={styles.socialButtons}
          >
            {(form: React.ReactNode) => (
              <>
                <RiText className={styles.subTitle}>Get started with</RiText>
                <RiTitle size="XL" className={styles.title}>
                  Redis Cloud account
                </RiTitle>
                {form}
                <OAuthAgreement />
              </>
            )}
          </OAuthForm>
        </RiFlexItem>
      </RiRow>
    </div>
  )
}

export default OAuthSignIn
