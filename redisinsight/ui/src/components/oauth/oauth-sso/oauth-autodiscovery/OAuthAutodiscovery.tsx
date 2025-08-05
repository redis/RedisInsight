import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { find } from 'lodash'
import { OAuthAgreement } from 'uiSrc/components/oauth/shared'
import {
  oauthCloudUserSelector,
  setOAuthCloudSource,
} from 'uiSrc/slices/oauth/cloud'
import {
  fetchSubscriptionsRedisCloud,
  setSSOFlow,
} from 'uiSrc/slices/instances/cloud'
import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { Pages } from 'uiSrc/constants'
import OAuthForm from 'uiSrc/components/oauth/shared/oauth-form'

import CloudIcon from 'uiSrc/assets/img/oauth/cloud_centered.svg?react'

import { OAuthSsoHandlerDialog } from 'uiSrc/components'
import { RiSpacer } from 'uiSrc/components/base/layout/spacer'
import { RiPrimaryButton } from 'uiSrc/components/base/forms'
import { RiTitle, RiText } from 'uiSrc/components/base/text'
import styles from './styles.module.scss'

export interface Props {
  inline?: boolean
  source?: OAuthSocialSource
  onClose?: () => void
}

const OAuthAutodiscovery = (props: Props) => {
  const { inline, source = OAuthSocialSource.Autodiscovery, onClose } = props
  const { data } = useSelector(oauthCloudUserSelector)

  const [isDiscoverDisabled, setIsDiscoverDisabled] = useState(false)

  const dispatch = useDispatch()
  const history = useHistory()

  const handleClickDiscover = () => {
    dispatch(setSSOFlow(OAuthSocialAction.Import))
    setIsDiscoverDisabled(true)
    dispatch(
      fetchSubscriptionsRedisCloud(
        null,
        true,
        () => {
          history.push(Pages.redisCloudSubscriptions)
          setIsDiscoverDisabled(false)
        },
        () => setIsDiscoverDisabled(false),
      ),
    )

    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_IMPORT_DATABASES_SUBMITTED,
      eventData: {
        source,
      },
    })
  }

  if (data) {
    const { accounts, currentAccountId } = data
    const currentAccountName = find(
      accounts,
      ({ id }) => id === currentAccountId,
    )

    return (
      <div className={styles.container} data-testid="oauth-container-import">
        <RiText className={styles.text} color="subdued">
          Use{' '}
          <strong>
            {currentAccountName?.name} #{currentAccountId}
          </strong>{' '}
          account to auto-discover subscriptions and add your databases.
        </RiText>
        <RiPrimaryButton
          onClick={handleClickDiscover}
          disabled={isDiscoverDisabled}
          data-testid="oauth-discover-btn"
        >
          Discover
        </RiPrimaryButton>
      </div>
    )
  }

  const handleClickSso = (accountOption: string) => {
    dispatch(setSSOFlow(OAuthSocialAction.Import))
    dispatch(setOAuthCloudSource(source))

    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_SIGN_IN_SOCIAL_ACCOUNT_SELECTED,
      eventData: {
        accountOption,
        action: OAuthSocialAction.Import,
        source,
      },
    })
  }

  const CreateFreeDb = () => (
    <div className={styles.createDbSection}>
      <div className={styles.createDbTitle}>
        <CloudIcon />
        <span>Start FREE with Redis Cloud</span>
      </div>
      <OAuthSsoHandlerDialog>
        {(ssoCloudHandlerClick) => (
          <RiPrimaryButton
            size="s"
            // todo: choose either href or on click
            // href={getUtmExternalLink(EXTERNAL_LINKS.tryFree, { campaign: '' })}
            // target="_blank"
            onClick={(e: React.MouseEvent) => {
              ssoCloudHandlerClick(e, {
                source: OAuthSocialSource.DiscoveryForm,
                action: OAuthSocialAction.Create,
              })
              onClose?.()
            }}
          >
            Quick start
          </RiPrimaryButton>
        )}
      </OAuthSsoHandlerDialog>
    </div>
  )

  return (
    <div className={styles.container} data-testid="oauth-container-import">
      <OAuthForm
        inline={inline}
        className={styles.buttonsContainer}
        onClick={handleClickSso}
        action={OAuthSocialAction.Import}
      >
        {(form: React.ReactNode) => (
          <>
            <RiText className={styles.text} color="subdued">
              Discover subscriptions and add your databases. A new Redis Cloud
              account will be created for you if you don’t have one.
            </RiText>
            <RiSpacer size="m" />
            <CreateFreeDb />
            <RiSpacer size="xl" />
            <RiText>Get started with</RiText>
            <RiTitle className={styles.title} size="L">
              Redis Cloud account
            </RiTitle>
            <RiSpacer size="xl" />
            {form}
            <RiSpacer size="xxl" />
            <div className={styles.containerAgreement}>
              <OAuthAgreement size="s" />
            </div>
          </>
        )}
      </OAuthForm>
    </div>
  )
}

export default OAuthAutodiscovery
