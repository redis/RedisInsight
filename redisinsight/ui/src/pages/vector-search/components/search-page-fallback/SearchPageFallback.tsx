import React from 'react'
import { useSelector } from 'react-redux'

import RqeIllustration from 'uiSrc/assets/img/vector-search/rqe-not-available.svg?react'
import { FeatureFlags } from 'uiSrc/constants'
import { UTM_CAMPAINGS } from 'uiSrc/constants/links'
import { OAuthSocialAction } from 'uiSrc/slices/interfaces'
import { FeatureFlagComponent, OAuthSsoHandlerDialog } from 'uiSrc/components'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import { Title } from 'uiSrc/components/base/text/Title'
import { ColorText } from 'uiSrc/components/base/text'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { Link } from 'uiSrc/components/base/link/Link'

import { SearchPageFallbackContent } from './SearchPageFallback.types'
import * as S from './SearchPageFallback.styles'

interface SearchPageFallbackProps {
  content: SearchPageFallbackContent
}

export const SearchPageFallback = ({ content }: SearchPageFallbackProps) => {
  const { [FeatureFlags.envDependent]: envDependentFeature } = useSelector(
    appFeatureFlagsFeaturesSelector,
  )

  const utmCampaign = UTM_CAMPAINGS[content.oauthSource]

  return (
    <S.StyledCard data-testid={content.testId}>
      <S.ScrollArea>
        <S.StyledCardBody>
          <S.ContentSection>
            <Title
              color="primary"
              size="XL"
              data-testid={`${content.testId}-title`}
            >
              {content.title}
            </Title>

            {content.subtitle && (
              <ColorText color="primary" variant="semiBold">
                {content.subtitle}
              </ColorText>
            )}

            {content.features && (
              <S.FeatureList data-testid={`${content.testId}-feature-list`}>
                {content.features.map((feature) => (
                  <S.FeatureListItem
                    key={feature}
                    iconType="ToastCheckIcon"
                    color="primary"
                    label={<ColorText color="primary">{feature}</ColorText>}
                  />
                ))}
              </S.FeatureList>
            )}

            <S.DescriptionText
              color="primary"
              data-testid={`${content.testId}-description`}
            >
              {content.description}
            </S.DescriptionText>

            <S.CtaText data-testid={`${content.testId}-cta-text`}>
              {content.ctaText}
            </S.CtaText>

            {envDependentFeature?.flag && (
              <S.ButtonWrapper data-testid={`${content.testId}-cta-wrapper`}>
                <FeatureFlagComponent name={FeatureFlags.cloudAds}>
                  <OAuthSsoHandlerDialog>
                    {(ssoCloudHandlerClick) => (
                      <Link
                        variant="inline"
                        target="_blank"
                        href={getUtmExternalLink(content.learnMoreLink, {
                          campaign: utmCampaign,
                        })}
                        onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                          ssoCloudHandlerClick(e as React.MouseEvent, {
                            source: content.oauthSource,
                            action: OAuthSocialAction.Create,
                          })
                        }}
                        data-testid={`${content.testId}-get-started-button`}
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
                  href={getUtmExternalLink(content.learnMoreLink, {
                    campaign: utmCampaign,
                  })}
                  data-testid={`${content.testId}-learn-more-link`}
                >
                  Learn more
                </Link>
              </S.ButtonWrapper>
            )}
          </S.ContentSection>

          <S.IllustrationSection data-testid={`${content.testId}-illustration`}>
            <RqeIllustration />
          </S.IllustrationSection>
        </S.StyledCardBody>
      </S.ScrollArea>
    </S.StyledCard>
  )
}
