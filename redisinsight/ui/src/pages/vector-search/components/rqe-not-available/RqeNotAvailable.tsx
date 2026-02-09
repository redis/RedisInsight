import React from 'react'
import { useSelector } from 'react-redux'

import RqeIllustration from 'uiSrc/assets/img/vector-search/rqe-not-available.svg?react'
import { FeatureFlags } from 'uiSrc/constants'
import { EXTERNAL_LINKS, UTM_CAMPAINGS } from 'uiSrc/constants/links'
import {
  OAuthSocialAction,
  OAuthSocialSource,
  RedisDefaultModules,
} from 'uiSrc/slices/interfaces'
import { FeatureFlagComponent, OAuthSsoHandlerDialog } from 'uiSrc/components'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import { MODULE_NOT_LOADED_CONTENT } from 'uiSrc/constants/workbenchResults'
import { Title } from 'uiSrc/components/base/text/Title'
import { ColorText } from 'uiSrc/components/base/text'
import { Spacer } from 'uiSrc/components/base/layout'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { Link } from 'uiSrc/components/base/link/Link'
import * as S from './RqeNotAvailable.styles'

export const RqeNotAvailable = () => {
  const { [FeatureFlags.envDependent]: envDependentFeature } = useSelector(
    appFeatureFlagsFeaturesSelector,
  )

  const utmCampaign = UTM_CAMPAINGS[OAuthSocialSource.BrowserSearch]
  const rqeContent = MODULE_NOT_LOADED_CONTENT[RedisDefaultModules.Search]

  return (
    <S.StyledCard data-testid="rqe-not-available">
      <S.StyledCardBody>
        <S.ContentSection>
          <Title
            color="primary"
            size="XL"
            data-testid="rqe-not-available-title"
          >
            {rqeContent?.title?.[0]}
          </Title>

          <Spacer size="m" />

          <ColorText color="primary" variant="semiBold">
            {rqeContent?.text?.[0]}
          </ColorText>

          <S.FeatureList data-testid="rqe-feature-list">
            {rqeContent?.improvements?.map((improvement: string) => (
              <S.FeatureListItem
                key={improvement}
                iconType="ToastCheckIcon"
                color="primary"
                label={<ColorText color="primary">{improvement}</ColorText>}
              />
            ))}
          </S.FeatureList>

          <S.DescriptionText color="primary" data-testid="rqe-description">
            {rqeContent?.additionalText}
          </S.DescriptionText>

          <Spacer size="xl" />

          <S.CtaText data-testid="rqe-cta-text">
            {rqeContent?.ctaText?.[0]}
          </S.CtaText>

          {envDependentFeature?.flag && (
            <S.CTAWrapper data-testid="rqe-cta-wrapper">
              <Spacer size="m" />
              <S.ButtonWrapper>
                <FeatureFlagComponent name={FeatureFlags.cloudAds}>
                  <OAuthSsoHandlerDialog>
                    {(ssoCloudHandlerClick) => (
                      <Link
                        variant="inline"
                        target="_blank"
                        href={getUtmExternalLink(EXTERNAL_LINKS.tryFree, {
                          campaign: utmCampaign,
                        })}
                        onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                          ssoCloudHandlerClick(e as React.MouseEvent, {
                            source: OAuthSocialSource.BrowserSearch,
                            action: OAuthSocialAction.Create,
                          })
                        }}
                        data-testid="rqe-get-started-button"
                      >
                        <PrimaryButton size="m">
                          Get started for free
                        </PrimaryButton>
                      </Link>
                    )}
                  </OAuthSsoHandlerDialog>
                </FeatureFlagComponent>

                <Link
                  variant="inline"
                  target="_blank"
                  href={getUtmExternalLink(EXTERNAL_LINKS.redisQueryEngine, {
                    campaign: utmCampaign,
                  })}
                  data-testid="rqe-learn-more-link"
                >
                  Learn more
                </Link>
              </S.ButtonWrapper>
            </S.CTAWrapper>
          )}
        </S.ContentSection>

        <S.IllustrationSection data-testid="rqe-illustration">
          <RqeIllustration />
        </S.IllustrationSection>
      </S.StyledCardBody>
    </S.StyledCard>
  )
}
