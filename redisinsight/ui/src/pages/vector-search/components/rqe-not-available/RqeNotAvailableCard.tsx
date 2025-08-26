import React from 'react'
import { RiIcon } from 'uiSrc/components/base/icons'
import { FlexGroup } from 'uiSrc/components/base/layout/flex'
import { Title, Text } from 'uiSrc/components/base/text'
import {
  StyledCard,
  StyledCardBody,
  StyledCardDescription,
} from './ReqNotAvailableCard.styles'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { Link } from 'uiSrc/components/base/link/Link'
import RqeNotAvailableImg from 'uiSrc/assets/img/vector-search/rqe-not-available.svg'
import { EXTERNAL_LINKS, UTM_MEDIUMS } from 'uiSrc/constants/links'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import { FeatureFlagComponent, OAuthSsoHandlerDialog } from 'uiSrc/components'
import { FeatureFlags } from 'uiSrc/constants'
import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'

export const RqeNotAvailableCard = () => {
  return (
    <StyledCard
      backgroundImage={RqeNotAvailableImg}
      data-testid="rqe-not-available-card"
    >
      <StyledCardBody direction="column" gap="xxl">
        <StyledCardDescription direction="column" gap="xl">
          <Title size="XL">
            Redis Query Engine is not available for this database
          </Title>

          <FlexGroup direction="column" gap="m">
            <Text size="M">Redis Query Engine allows to:</Text>

            <FlexGroup direction="row" gap="xl">
              <FlexGroup direction="row" align="center">
                <RiIcon type="ToastCheckIcon" />
                <Text>Query</Text>
              </FlexGroup>
              <FlexGroup direction="row" align="center">
                <RiIcon type="ToastCheckIcon" />
                <Text>Secondary index</Text>
              </FlexGroup>
              <FlexGroup direction="row" align="center">
                <RiIcon type="ToastCheckIcon" />
                <Text>Full-text search</Text>
              </FlexGroup>
            </FlexGroup>
          </FlexGroup>

          <Text size="S">
            These features enable multi-field queries, aggregation, exact phrase
            matching, numeric filtering, geo filtering and vector similarity
            semantic search on top of text queries.
          </Text>

          <Text size="S">
            Use your free trial all-in-one Redis Cloud database to start
            exploring these capabilities
          </Text>
        </StyledCardDescription>

        <FeatureFlagComponent
          name={[FeatureFlags.cloudSso, FeatureFlags.cloudAds]}
        >
          <FlexGroup direction="column" gap="m" align="center">
            <OAuthSsoHandlerDialog>
              {(ssoCloudHandlerClick) => (
                <PrimaryButton
                  onClick={(e) => {
                    ssoCloudHandlerClick(e, {
                      source: OAuthSocialSource.BrowserFiltering,
                      action: OAuthSocialAction.Create,
                    })
                  }}
                  data-testid="get-started-link"
                  size="l"
                >
                  Get started for free
                </PrimaryButton>
              )}
            </OAuthSsoHandlerDialog>
            <Link
              href={getUtmExternalLink(EXTERNAL_LINKS.redisQueryEngine, {
                medium: UTM_MEDIUMS.Recommendation,
                campaign: 'redisinsight_browser_search',
              })}
              color="subdued"
            >
              Learn more
            </Link>
          </FlexGroup>
        </FeatureFlagComponent>
      </StyledCardBody>
    </StyledCard>
  )
}
