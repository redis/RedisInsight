import React from 'react'

import { AddDbType } from 'uiSrc/pages/home/constants'
import { FeatureFlagComponent, OAuthSsoHandlerDialog } from 'uiSrc/components'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import { EXTERNAL_LINKS, UTM_CAMPAINGS } from 'uiSrc/constants/links'
import { FeatureFlags } from 'uiSrc/constants'
import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { Col, FlexItem, Grid, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { Text } from 'uiSrc/components/base/text/Text'
import { RiIcon } from 'uiSrc/components/base/icons'
import { Loader } from 'uiSrc/components/base/display'
import { useConnectivityOptions } from '../../hooks/useConnectivityOptions'

import {
  StyledBadge,
  StyledConnectivityLink,
  StyledIcon,
} from './ConnectivityOptions.styles'

export interface Props {
  onClickOption: (type: AddDbType) => void
  onClose?: () => void
}

const ConnectivityOptions = (props: Props) => {
  const { onClickOption, onClose } = props
  const connectivityOptions = useConnectivityOptions({ onClickOption })

  return (
    <>
      <section>
        <Text color="primary">Get started with Redis Cloud account</Text>
        <Spacer />
        <Grid gap="l" columns={3} responsive>
          <FlexItem>
            <StyledConnectivityLink
              onClick={() => onClickOption(AddDbType.cloud)}
              data-testid="discover-cloud-btn"
            >
              <Col align="center" gap="s">
                <StyledIcon type="CloudIcon" size="xl" />
                <Text color="primary">Add databases</Text>
              </Col>
            </StyledConnectivityLink>
          </FlexItem>
          <FeatureFlagComponent name={FeatureFlags.cloudAds}>
            <FlexItem>
              <OAuthSsoHandlerDialog>
                {(ssoCloudHandlerClick, isSSOEnabled) => (
                  <StyledConnectivityLink
                    data-testid="create-free-db-btn"
                    color="primary"
                    onClick={(e: React.MouseEvent) => {
                      ssoCloudHandlerClick(e, {
                        source: OAuthSocialSource.AddDbForm,
                        action: OAuthSocialAction.Create,
                      })
                      isSSOEnabled && onClose?.()
                    }}
                    href={getUtmExternalLink(EXTERNAL_LINKS.tryFree, {
                      campaign: UTM_CAMPAINGS[OAuthSocialSource.AddDbForm],
                    })}
                    target="_blank"
                  >
                    <StyledBadge label="FREE" variant="notice" />
                    <Col align="center" gap="s">
                      <StyledIcon type="RocketIcon" size="xl" />
                      <Text color="primary">New database</Text>
                    </Col>
                  </StyledConnectivityLink>
                )}
              </OAuthSsoHandlerDialog>
            </FlexItem>
          </FeatureFlagComponent>
        </Grid>
      </section>
      <Spacer size="xxl" />
      <section>
        <Text color="primary">More connectivity options</Text>
        <Spacer />
        <Grid gap="l" responsive columns={4}>
          {connectivityOptions.map((option) => (
            <FlexItem key={option.id}>
              <StyledConnectivityLink
                onClick={() => !option.loading && option.onClick()}
                data-testid={`option-btn-${option.id}`}
              >
                <Row gap="s" align="center" justify="center">
                  {option.loading ? (
                    <Loader size="xl" />
                  ) : (
                    <RiIcon type={option.icon} size="xl" />
                  )}
                  <Text color="primary">{option.title}</Text>
                </Row>
              </StyledConnectivityLink>
            </FlexItem>
          ))}
        </Grid>
      </section>
    </>
  )
}

export default ConnectivityOptions
