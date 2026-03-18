import React from 'react'
import { useSelector } from 'react-redux'

import { OAuthSocialAction } from 'uiSrc/slices/interfaces'
import {
  FeatureFlagComponent,
  OAuthConnectFreeDb,
  OAuthSsoHandlerDialog,
} from 'uiSrc/components'
import { freeInstancesSelector } from 'uiSrc/slices/instances/instances'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import {
  EXTERNAL_LINKS,
  UTM_CAMPAINGS,
  UTM_MEDIUMS,
} from 'uiSrc/constants/links'
import { FeatureFlags } from 'uiSrc/constants'
import { Text, Title } from 'uiSrc/components/base/text'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { Col } from 'uiSrc/components/base/layout/flex'
import { Link } from 'uiSrc/components/base/link/Link'
import { FeatureNotAvailableContent } from './FeatureNotAvailable.types'
import { FILTER_NOT_AVAILABLE_CONTENT } from './constants'
import * as S from './FeatureNotAvailable.styles'

interface FeatureNotAvailableProps {
  onClose?: () => void
  content?: FeatureNotAvailableContent
}

const FeatureNotAvailable = ({
  onClose,
  content = FILTER_NOT_AVAILABLE_CONTENT,
}: FeatureNotAvailableProps) => {
  const freeInstances = useSelector(freeInstancesSelector) || []
  const learnMoreUtm = {
    medium: UTM_MEDIUMS.Main,
    campaign: UTM_CAMPAINGS[content.utmCampaign],
  }

  return (
    <S.Container gap="l" data-testid={content.testId}>
      <RiIcon type="RedisDbBlueIcon" size="original" />
      <Title size="L" data-testid={`${content.testId}-title`}>
        {content.title}
      </Title>
      <Text color="primary" data-testid={`${content.testId}-description`}>
        {content.description}
      </Text>
      {!!freeInstances.length && (
        <>
          <Text color="primary">{content.freeInstanceText}</Text>
          <OAuthConnectFreeDb
            id={freeInstances[0].id}
            source={content.oauthSource}
            onSuccessClick={onClose}
          />
        </>
      )}
      {!freeInstances.length && (
        <FeatureFlagComponent name={FeatureFlags.cloudAds}>
          <Text color="primary">{content.noInstanceText}</Text>
          <Col align="center" gap="m">
            <OAuthSsoHandlerDialog>
              {(ssoCloudHandlerClick) => (
                <PrimaryButton
                  onClick={(e) => {
                    ssoCloudHandlerClick(e, {
                      source: content.oauthSource,
                      action: OAuthSocialAction.Create,
                    })
                    onClose?.()
                  }}
                  data-testid={`${content.testId}-get-started-link`}
                  size="m"
                >
                  Get Started For Free
                </PrimaryButton>
              )}
            </OAuthSsoHandlerDialog>
            <Link
              variant="inline"
              target="_blank"
              href={getUtmExternalLink(EXTERNAL_LINKS.redisStack, learnMoreUtm)}
              data-testid={`${content.testId}-learn-more-link`}
            >
              Learn More
            </Link>
          </Col>
        </FeatureFlagComponent>
      )}
    </S.Container>
  )
}

export default FeatureNotAvailable
