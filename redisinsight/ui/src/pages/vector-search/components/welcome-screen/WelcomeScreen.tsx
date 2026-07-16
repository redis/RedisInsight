import React from 'react'

import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { Text, Title } from 'uiSrc/components/base/text'
import { RiIcon, AllIconsType } from 'uiSrc/components/base/icons'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { useTranslation } from 'uiSrc/i18n'

import { getFeatures } from './WelcomeScreen.constants'
import type { WelcomeScreenProps } from './WelcomeScreen.types'
import * as S from './WelcomeScreen.styles'

export const WelcomeScreen = ({
  onTrySampleDataClick,
  onUseMyDatabaseClick,
}: WelcomeScreenProps) => {
  const { t } = useTranslation()
  const features = getFeatures()

  return (
    <S.Container data-testid="welcome-screen">
      <S.ScrollArea>
        <S.Content>
          <Col gap="m">
            <Title
              size="XL"
              color="primary"
              data-testid="welcome-screen--title"
            >
              {t('vectorSearch.welcome.title')}
            </Title>
            <Text
              size="L"
              color="primary"
              data-testid="welcome-screen--subtitle"
            >
              {t('vectorSearch.welcome.subtitle')}
            </Text>
          </Col>

          <Spacer size="7.2rem" />

          <S.FeaturesContainer
            wrap
            gap="xl"
            data-testid="welcome-screen--features"
          >
            {features.map((feature) => (
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
              {t('vectorSearch.welcome.trySampleData')}
            </PrimaryButton>

            <SecondaryButton
              filled
              size="l"
              onClick={onUseMyDatabaseClick}
              data-testid="welcome-screen--use-my-database-btn"
            >
              {t('vectorSearch.welcome.useMyDatabase')}
            </SecondaryButton>
          </Row>
        </S.Content>
      </S.ScrollArea>

      <S.BackgroundImage data-testid="welcome-screen--background" />
    </S.Container>
  )
}
