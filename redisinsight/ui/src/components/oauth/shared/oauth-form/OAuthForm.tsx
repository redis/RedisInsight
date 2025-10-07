import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { signIn } from 'uiSrc/slices/oauth/cloud'
import { OAuthSocialAction, OAuthStrategy } from 'uiSrc/slices/interfaces'
import { ipcAuth } from 'uiSrc/electron/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { enableUserAnalyticsAction } from 'uiSrc/slices/user/user-settings'
import OAuthSsoForm from './components/oauth-sso-form'
import OAuthSocialButtons from '../oauth-social-buttons'
import { Props as OAuthSocialButtonsProps } from '../oauth-social-buttons/OAuthSocialButtons'

export interface Props extends OAuthSocialButtonsProps {
  action: OAuthSocialAction
  children: (form: React.ReactNode) => JSX.Element
}

const OAuthForm = ({ children, action, onClick, ...rest }: Props) => {
  const dispatch = useDispatch()

  const [authStrategy, setAuthStrategy] = useState('')
  const [disabled, setDisabled] = useState(false)

  const initOAuthProcess = (
    strategy: OAuthStrategy,
    action: string,
    data?: {},
  ) => {
    dispatch(signIn())
    ipcAuth(strategy, action, data)
  }

  const onSocialButtonClick = (authStrategy: OAuthStrategy) => {
    setDisabled(true)
    setTimeout(() => {
      setDisabled(false)
    }, 1000)
    dispatch(enableUserAnalyticsAction(authStrategy))
    setAuthStrategy(authStrategy)
    onClick?.(authStrategy)

    switch (authStrategy) {
      case OAuthStrategy.Microsoft:
      case OAuthStrategy.Google:
      case OAuthStrategy.GitHub:
        initOAuthProcess(authStrategy, action)
        break
      case OAuthStrategy.SSO:
        // ignore. sso email form will be shown
        break
      default:
        break
    }
  }

  const onSsoBackButtonClick = () => {
    setAuthStrategy('')
    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_SIGN_IN_SSO_OPTION_CANCELED,
      eventData: {
        action,
      },
    })
  }

  const onSsoLoginButtonClick = (data: {}) => {
    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_SIGN_IN_SSO_OPTION_PROCEEDED,
      eventData: {
        action,
      },
    })
    initOAuthProcess(OAuthStrategy.SSO, action, data)
  }

  if (authStrategy === OAuthStrategy.SSO) {
    return (
      <OAuthSsoForm
        onBack={onSsoBackButtonClick}
        onSubmit={onSsoLoginButtonClick}
      />
    )
  }

  return children(
    <OAuthSocialButtons
      onClick={onSocialButtonClick}
      {...rest}
      disabled={disabled}
    />,
  )
}

export default OAuthForm
