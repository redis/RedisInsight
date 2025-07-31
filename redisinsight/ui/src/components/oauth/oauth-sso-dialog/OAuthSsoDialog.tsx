import React, { useCallback } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import cx from 'classnames'
import {
  oauthCloudSelector,
  setSocialDialogState,
} from 'uiSrc/slices/oauth/cloud'
import { OAuthSocialAction } from 'uiSrc/slices/interfaces'
import { cloudSelector } from 'uiSrc/slices/instances/cloud'
import { OAuthCreateDb, OAuthSignIn } from 'uiSrc/components/oauth/oauth-sso'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { Modal } from 'uiSrc/components/base/display'
import styles from './styles.module.scss'

const OAuthSsoDialog = () => {
  const { ssoFlow } = useSelector(cloudSelector)
  const { isOpenSocialDialog, source } = useSelector(oauthCloudSelector)

  const dispatch = useDispatch()

  const handleClose = useCallback(() => {
    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_SIGN_IN_FORM_CLOSED,
      eventData: {
        action: ssoFlow,
      },
    })
    dispatch(setSocialDialogState(null))
  }, [ssoFlow])

  if (!isOpenSocialDialog || !ssoFlow) {
    return null
  }

  return (
    <Modal
      open
      onCancel={handleClose}
      className={cx(styles.modal, {
        [styles.createDb]: ssoFlow === OAuthSocialAction.Create,
        [styles.signIn]: ssoFlow === OAuthSocialAction.SignIn,
        [styles.import]: ssoFlow === OAuthSocialAction.Import,
      })}
      data-testid="social-oauth-dialog"
      title={null}
      content={
        <>
          {ssoFlow === OAuthSocialAction.Create && (
            <OAuthCreateDb source={source} />
          )}
          {ssoFlow === OAuthSocialAction.SignIn && (
            <OAuthSignIn source={source} />
          )}
          {ssoFlow === OAuthSocialAction.Import && (
            <OAuthSignIn action={OAuthSocialAction.Import} source={source} />
          )}
        </>
      }
    />
  )
}

export default OAuthSsoDialog
