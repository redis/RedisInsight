import React from 'react'
import cx from 'classnames'
import styled from 'styled-components'

import { AddDbType } from 'uiSrc/pages/home/constants'
import { FeatureFlagComponent, OAuthSsoHandlerDialog } from 'uiSrc/components'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import { EXTERNAL_LINKS, UTM_CAMPAINGS } from 'uiSrc/constants/links'
import { FeatureFlags } from 'uiSrc/constants'
import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'

// to be replaced with cloud icon from @redis-ui/icons once redis-ui bumped
import CloudIcon from 'uiSrc/assets/img/oauth/cloud_centered.svg?react'
import { RocketIcon } from 'uiSrc/components/base/icons'

import { Col, FlexItem, Grid } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { SecondaryButton } from 'uiSrc/components/base/forms/buttons'
import { Title } from 'uiSrc/components/base/text/Title'
import { RiBadge } from 'uiSrc/components/base/display/badge/RiBadge'
import { Text } from 'uiSrc/components/base/text/Text'
import { Link } from 'uiSrc/components/base/link/Link'
import { CONNECTIVITY_OPTIONS } from '../../constants'

import styles from './styles.module.scss'

export interface Props {
  onClickOption: (type: AddDbType) => void
  onClose?: () => void
}

const NewCloudLink = styled(Link)`
  min-width: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none !important;
  & * {
    text-decoration: none !important;
  }
  position: relative;
  width: 100%;
  height: 84px !important;
  padding: 0 12px;
  color: var(--buttonSecondaryTextColor) !important;
  border: 1px solid ${({ theme }) => theme.semantic.color.border.primary500};
  border-radius: 5px;
  & .freeBadge {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;

    text-transform: uppercase;
    background-color: var(--euiColorLightestShade);
    border: 1px solid var(--euiColorPrimary);
    border-radius: 2px !important;
  }

  & .btnIcon {
    margin-bottom: 8px;
    width: 24px;
    height: 24px;
    fill: currentColor;
  }
`

const ConnectivityOptions = (props: Props) => {
  const { onClickOption, onClose } = props

  return (
    <>
      <section className={styles.cloudSection}>
        <Text color="primary">
          Get started with Redis Cloud account
        </Text>
        <Spacer />
        <Grid gap="l" columns={3} responsive>
          <FlexItem>
            <SecondaryButton
              className={styles.typeBtn}
              onClick={() => onClickOption(AddDbType.cloud)}
              data-testid="discover-cloud-btn"
            >
              <Col align="center">
                <CloudIcon className={styles.btnIcon} />
                Add databases
              </Col>
            </SecondaryButton>
          </FlexItem>
          <FeatureFlagComponent name={FeatureFlags.cloudAds}>
            <FlexItem>
              <OAuthSsoHandlerDialog>
                {(ssoCloudHandlerClick, isSSOEnabled) => (
                  <NewCloudLink
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
                    <RiBadge className="freeBadge" label="Free" />
                    <Col align="center">
                      <RocketIcon className="btnIcon" />
                      New database
                    </Col>
                  </NewCloudLink>
                )}
              </OAuthSsoHandlerDialog>
            </FlexItem>
          </FeatureFlagComponent>
          <FlexItem grow />
        </Grid>
      </section>
      <Spacer size="xxl" />
      <section>
        <Text color="primary">
          More connectivity options
        </Text>
        <Spacer />
        <Grid gap="l" responsive columns={3}>
          {CONNECTIVITY_OPTIONS.map(({ id, type, title, icon }) => (
            <FlexItem key={id}>
              <SecondaryButton
                icon={icon}
                onClick={() => onClickOption(type)}
                data-testid={`option-btn-${id}`}
                size="large"
              >
                {title}
              </SecondaryButton>
            </FlexItem>
          ))}
        </Grid>
      </section>
    </>
  )
}

export default ConnectivityOptions
