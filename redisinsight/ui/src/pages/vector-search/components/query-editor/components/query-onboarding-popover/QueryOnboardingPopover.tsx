import React, { useCallback, useState } from 'react'

import { useTranslation } from 'uiSrc/i18n'
import { RiPopover } from 'uiSrc/components/base'
import { Button } from 'uiSrc/components/base/forms/buttons'
import { Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import BrowserStorageItem from 'uiSrc/constants/storage'
import { localStorageService } from 'uiSrc/services'
import { QueryOnboardingPopoverProps } from './QueryOnboardingPopover.types'
import * as S from './QueryOnboardingPopover.styles'

export const QueryOnboardingPopover = ({
  children,
}: QueryOnboardingPopoverProps) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(
    () =>
      localStorageService.get(
        BrowserStorageItem.vectorSearchQueryOnboarding,
      ) !== true,
  )

  const handleDismiss = useCallback(() => {
    localStorageService.set(
      BrowserStorageItem.vectorSearchQueryOnboarding,
      true,
    )
    setIsOpen(false)
  }, [])

  if (!isOpen) {
    return <>{children}</>
  }

  return (
    <RiPopover
      isOpen
      anchorPosition="rightUp"
      data-testid="query-library-onboarding-popover"
      trigger={children}
    >
      <S.Content gap="l" data-testid="query-library-onboarding-content">
        <Text size="L" variant="semiBold" color="primary">
          {t('vectorSearch.query.onboarding.title')}
        </Text>
        <Text size="m" color="secondary">
          {t('vectorSearch.query.onboarding.description')}
        </Text>

        <S.Section>
          <Text size="m" variant="semiBold" color="primary">
            {t('vectorSearch.query.onboarding.editorTitle')}
          </Text>
          <Text size="s" color="secondary">
            {t('vectorSearch.query.onboarding.editorDescription')}
          </Text>
        </S.Section>

        <S.Section>
          <Text size="m" variant="semiBold" color="primary">
            {t('vectorSearch.query.onboarding.libraryTitle')}
          </Text>
          <Text size="s" color="secondary">
            {t('vectorSearch.query.onboarding.libraryDescription')}
          </Text>
        </S.Section>

        <Row justify="end">
          <Button
            size="small"
            onClick={handleDismiss}
            data-testid="query-library-onboarding-dismiss"
          >
            {t('vectorSearch.query.onboarding.dismiss')}
          </Button>
        </Row>
      </S.Content>
    </RiPopover>
  )
}
