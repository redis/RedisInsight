import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  createFreeDbJob,
  fetchPlans,
  oauthCloudUserSelector,
  setSocialDialogState,
  showOAuthProgress,
} from 'uiSrc/slices/oauth/cloud'

import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { FeatureFlags } from 'uiSrc/constants'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { CloudJobName, CloudJobStep } from 'uiSrc/electron/constants'
import {
  addInfiniteNotification,
  removeInfiniteNotification,
} from 'uiSrc/slices/app/notifications'
import {
  INFINITE_MESSAGES,
  InfiniteMessagesIds,
} from 'uiSrc/components/notifications/components'
import {
  setIsRecommendedSettingsSSO,
  setSSOFlow,
} from 'uiSrc/slices/instances/cloud'
import { Nullable } from 'uiSrc/utils'
import OAuthForm from 'uiSrc/components/oauth/shared/oauth-form'
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'
import {
  OAuthAdvantages,
  OAuthAgreement,
  OAuthRecommendedSettings,
} from '../../shared'
import * as S from '../../OAuth.styles'
import { StyledAdvantagesContainerAbsolute } from '../../shared/styles'

export interface Props {
  source?: Nullable<OAuthSocialSource>
}

const OAuthCreateDb = (props: Props) => {
  const { source } = props
  const { data } = useSelector(oauthCloudUserSelector)
  const {
    [FeatureFlags.cloudSsoRecommendedSettings]: isRecommendedFeatureEnabled,
  } = useSelector(appFeatureFlagsFeaturesSelector)

  const [isRecommended, setIsRecommended] = useState(
    isRecommendedFeatureEnabled?.flag ? true : undefined,
  )

  const dispatch = useDispatch()

  const handleSocialButtonClick = (accountOption: string) => {
    dispatch(setIsRecommendedSettingsSSO(isRecommended))
    const cloudRecommendedSettings = !isRecommendedFeatureEnabled?.flag
      ? 'not displayed'
      : isRecommended
        ? 'enabled'
        : 'disabled'

    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_SIGN_IN_SOCIAL_ACCOUNT_SELECTED,
      eventData: {
        accountOption,
        action: OAuthSocialAction.Create,
        cloudRecommendedSettings,
        source,
      },
    })
  }

  const handleChangeRecommendedSettings = (value: boolean) => {
    setIsRecommended(value)
  }

  const handleClickCreate = () => {
    dispatch(setSSOFlow(OAuthSocialAction.Create))
    dispatch(showOAuthProgress(true))
    dispatch(
      addInfiniteNotification(
        INFINITE_MESSAGES.PENDING_CREATE_DB(CloudJobStep.Credentials),
      ),
    )
    dispatch(setSocialDialogState(null))

    if (isRecommended) {
      dispatch(
        createFreeDbJob({
          name: CloudJobName.CreateFreeSubscriptionAndDatabase,
          resources: {
            isRecommendedSettings: isRecommended,
          },
          onFailAction: () => {
            dispatch(
              removeInfiniteNotification(InfiniteMessagesIds.oAuthProgress),
            )
            dispatch(setSSOFlow(undefined))
          },
        }),
      )

      return
    }

    dispatch(fetchPlans())
  }

  return (
    <S.SsoContainer data-testid="oauth-container-create-db">
      <Row>
        <S.SsoAdvantagesContainer as={FlexItem} grow>
          <StyledAdvantagesContainerAbsolute>
            <OAuthAdvantages />
          </StyledAdvantagesContainerAbsolute>
        </S.SsoAdvantagesContainer>
        <S.SsoSocialContainer as={FlexItem} grow>
          {!data ? (
            <OAuthForm
              onClick={handleSocialButtonClick}
              action={OAuthSocialAction.Create}
            >
              {(form: React.ReactNode) => (
                <>
                  <Col align="center">
                    <Text color="primary" size="L">
                      Get started with
                    </Text>
                    <S.SsoTitle as={Title} size="XL" color="primary">
                      Free Redis Cloud database
                    </S.SsoTitle>
                  </Col>

                  <S.SsoSocialButtons>{form}</S.SsoSocialButtons>
                  <div>
                    <OAuthRecommendedSettings
                      value={isRecommended}
                      onChange={handleChangeRecommendedSettings}
                    />
                    <OAuthAgreement />
                  </div>
                </>
              )}
            </OAuthForm>
          ) : (
            <>
              <Col align="center">
                <Text color="primary" size="L">
                  Get your
                </Text>
                <S.SsoTitle as={Title} size="XL" color="primary">
                  Free Redis Cloud database
                </S.SsoTitle>
              </Col>
              <Spacer size="xl" />
              <Text textAlign="center" color="primary">
                The database will be created automatically and can be changed
                from Redis Cloud.
              </Text>
              <Spacer size="xl" />
              <OAuthRecommendedSettings
                value={isRecommended}
                onChange={handleChangeRecommendedSettings}
              />
              <Spacer />
              <PrimaryButton
                onClick={handleClickCreate}
                data-testid="oauth-create-db"
              >
                Create
              </PrimaryButton>
            </>
          )}
        </S.SsoSocialContainer>
      </Row>
    </S.SsoContainer>
  )
}

export default OAuthCreateDb
