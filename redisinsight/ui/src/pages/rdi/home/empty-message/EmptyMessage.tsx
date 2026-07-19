import React, { useContext } from 'react'

import EmptyListDarkIcon from 'uiSrc/assets/img/rdi/empty_list_dark.svg'
import EmptyListLightIcon from 'uiSrc/assets/img/rdi/empty_list_light.svg'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { Theme } from 'uiSrc/constants'

import { Text, Title } from 'uiSrc/components/base/text'
import { Col, FlexItem } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { RiImage } from 'uiSrc/components/base/display'
import { EmptyPageContainer } from 'uiSrc/pages/rdi/home/empty-message/styles'
import { useTranslation } from 'uiSrc/i18n'

export interface Props {
  onAddInstanceClick: () => void
}

const EmptyMessage = ({ onAddInstanceClick }: Props) => {
  const { theme } = useContext(ThemeContext)
  const { t } = useTranslation()
  return (
    <EmptyPageContainer grow>
      <Col data-testid="empty-rdi-instance-list" align="center" gap="xxl">
        <Spacer size="space400" />
        <FlexItem>
          <Col align="center" gap="m">
            <Title color="primary">{t('rdi.home.empty.title')}</Title>
            <FlexItem>
              <Col align="center">
                <Text color="primary">{t('rdi.home.empty.description')}</Text>
              </Col>
            </FlexItem>
          </Col>
        </FlexItem>
        <FlexItem>
          <PrimaryButton
            data-testid="empty-rdi-instance-button"
            size="l"
            onClick={onAddInstanceClick}
          >
            {t('rdi.home.empty.button')}
          </PrimaryButton>
        </FlexItem>
        <Spacer size="space600" />
        <FlexItem>
          <RiImage
            src={theme === Theme.Dark ? EmptyListDarkIcon : EmptyListLightIcon}
            alt="empty"
          />
        </FlexItem>
      </Col>
    </EmptyPageContainer>
  )
}

export default EmptyMessage
