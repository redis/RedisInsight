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

import { OAuthSsoHandlerDialog } from 'uiSrc/components'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'
import { Row } from 'uiSrc/components/base/layout/flex'
import { CloudIcon } from 'uiSrc/components/base/icons'

import {
  StyledDiscoverText,
  StyledContainer,
  StyledCreateDbSection,
  StyledAgreementContainer,
} from './OAuthAutodiscovery.styles'

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
        <Text>
          Use{' '}
          <strong>
            {currentAccountName?.name} #{currentAccountId}
          </strong>{' '}
          account to auto-discover subscriptions and add your databases.
        </Text>
        <Spacer size="xl" />
        <PrimaryButton
          onClick={handleClickDiscover}
          disabled={isDiscoverDisabled}
          data-testid="oauth-discover-btn"
        >
          Discover
        </PrimaryButton>
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
    <StyledCreateDbSection justify="between" align="center">
      <Row align="center" gap="m">
        <CloudIcon size="L" />
        <Text>Start FREE with Redis Cloud</Text>
      </Row>
      <OAuthSsoHandlerDialog>
        {(ssoCloudHandlerClick) => (
          <PrimaryButton
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
          </PrimaryButton>
        )}
      </OAuthSsoHandlerDialog>
    </StyledCreateDbSection>
  )

  return (
    <StyledContainer
      data-testid="oauth-container-import"
      align="center"
      gap="xl"
    >
      <OAuthForm
        inline={inline}
        onClick={handleClickSso}
        action={OAuthSocialAction.Import}
      >
        {(form: React.ReactNode) => (
          <>
            <StyledDiscoverText>
              Discover subscriptions and add your databases. A new Redis Cloud
              account will be created for you if you don’t have one.
            </StyledDiscoverText>

            <CreateFreeDb />

            <Text>Get started with</Text>
            <Title size="L">Redis Cloud account</Title>

            {form}

            <StyledAgreementContainer>
              <OAuthAgreement size="s" />
            </StyledAgreementContainer>
          </>
        )}
      </OAuthForm>
    </StyledContainer>
  )
}

export default OAuthAutodiscovery
