import React from 'react'

import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { Text, Title } from 'uiSrc/components/base/text'
import { RiIcon, AllIconsType } from 'uiSrc/components/base/icons'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { RiTooltip } from 'uiSrc/components/base/tooltip'

import {
  FEATURES,
  TITLE,
  SUBTITLE,
  TRY_SAMPLE_DATA_LABEL,
  USE_MY_DATABASE_LABEL,
} from './WelcomeScreen.constants'
import type { WelcomeScreenProps } from './WelcomeScreen.types'
import * as S from './WelcomeScreen.styles'

export const WelcomeScreen = ({
  onTrySampleDataClick,
  onUseMyDatabaseClick,
  useMyDatabaseDisabled,
}: WelcomeScreenProps) => {
  const isUseMyDatabaseDisabled = !!useMyDatabaseDisabled
  const useMyDatabaseTooltip = useMyDatabaseDisabled?.tooltip

  return (
    <S.Container data-testid="welcome-screen">
      <S.Content>
        <Col gap="m">
          <Title size="XL" color="primary" data-testid="welcome-screen--title">
            {TITLE}
          </Title>
          <Text size="L" color="primary" data-testid="welcome-screen--subtitle">
            {SUBTITLE}
          </Text>
        </Col>

        <Spacer size="7.2rem" />

        <S.FeaturesContainer
          wrap
          gap="xl"
          data-testid="welcome-screen--features"
        >
          {FEATURES.map((feature) => (
            <S.FeatureItem
              key={feature.title}
              gap="xs"
              data-testid={`welcome-screen--feature-${feature.icon}`}
            >
              <RiIcon
                type={feature.icon as AllIconsType}
                size="xl"
                color="neutral800"
              />
              <Spacer size="space050" />
              <Text size="M" variant="semiBold" color="primary">
                {feature.title}
              </Text>
              <Text size="S" color="secondary">
                {feature.description}
              </Text>
            </S.FeatureItem>
          ))}
        </S.FeaturesContainer>

        <Spacer size="11.2rem" />

        <Row gap="l" data-testid="welcome-screen--actions">
          <PrimaryButton
            size="l"
            onClick={onTrySampleDataClick}
            data-testid="welcome-screen--try-sample-data-btn"
          >
            {TRY_SAMPLE_DATA_LABEL}
          </PrimaryButton>

          <RiTooltip
            content={isUseMyDatabaseDisabled ? useMyDatabaseTooltip : null}
            anchorClassName="euiToolTip__btn-disabled"
          >
            <SecondaryButton
              filled
              size="l"
              onClick={onUseMyDatabaseClick}
              disabled={isUseMyDatabaseDisabled}
              data-testid="welcome-screen--use-my-database-btn"
            >
              {USE_MY_DATABASE_LABEL}
            </SecondaryButton>
          </RiTooltip>
        </Row>
      </S.Content>

      <S.BackgroundImage data-testid="welcome-screen--background" />
    </S.Container>
  )
}
