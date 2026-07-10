import React, { useCallback, useEffect, useState } from 'react'
import { useAppSelector } from 'uiSrc/slices/hooks'

import { useTranslation } from 'uiSrc/i18n'
import { RiPopover } from 'uiSrc/components/base'
import { Button, IconButton } from 'uiSrc/components/base/forms/buttons'
import { CancelSlimIcon } from 'uiSrc/components/base/icons'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import BrowserStorageItem from 'uiSrc/constants/storage'
import { localStorageService } from 'uiSrc/services'
import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'

import * as S from './SelectKeyOnboardingPopover.styles'

export interface SelectKeyOnboardingPopoverProps {
  children: React.ReactNode
}

interface PopoverContentProps {
  children: React.ReactNode
  onDismiss: () => void
}

const PopoverContent = ({ children, onDismiss }: PopoverContentProps) => {
  const { t } = useTranslation()
  const selectedKey = useAppSelector(selectedKeyDataSelector)

  useEffect(() => {
    if (selectedKey?.name) {
      onDismiss()
    }
  }, [selectedKey?.name, onDismiss])

  return (
    <RiPopover
      isOpen
      anchorPosition="rightCenter"
      data-testid="select-key-onboarding-popover"
      trigger={children}
    >
      <S.Content gap="l" data-testid="select-key-onboarding-content">
        <Col gap="s">
          <Row justify="end">
            <IconButton
              icon={CancelSlimIcon}
              onClick={onDismiss}
              size="S"
              aria-label={t('vectorSearch.selectKeyOnboarding.close')}
              data-testid="select-key-onboarding-close"
            />
          </Row>
          <Text size="L" variant="semiBold" color="primary">
            {t('vectorSearch.selectKeyOnboarding.title')}
          </Text>
        </Col>
        <Col gap="m">
          <Text size="m" color="secondary">
            {t('vectorSearch.selectKeyOnboarding.body1')}
          </Text>
          <Text size="m" color="secondary">
            {t('vectorSearch.selectKeyOnboarding.body2')}
          </Text>
        </Col>
        <Row justify="end">
          <Button
            size="small"
            onClick={onDismiss}
            data-testid="select-key-onboarding-dismiss"
          >
            {t('vectorSearch.selectKeyOnboarding.gotIt')}
          </Button>
        </Row>
      </S.Content>
    </RiPopover>
  )
}

export const SelectKeyOnboardingPopover = ({
  children,
}: SelectKeyOnboardingPopoverProps) => {
  const [isOpen, setIsOpen] = useState(
    () =>
      localStorageService.get(
        BrowserStorageItem.vectorSearchSelectKeyOnboarding,
      ) !== true,
  )

  const handleDismiss = useCallback(() => {
    localStorageService.set(
      BrowserStorageItem.vectorSearchSelectKeyOnboarding,
      true,
    )
    setIsOpen(false)
  }, [])

  if (!isOpen) {
    return <>{children}</>
  }

  return <PopoverContent onDismiss={handleDismiss}>{children}</PopoverContent>
}
