import React, { useCallback, useState } from 'react'

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
          Index created successfully.
        </Text>
        <Text size="m" color="secondary">
          Your data is now searchable. Choose how you&apos;d like to search
        </Text>

        <S.Section>
          <Text size="m" variant="semiBold" color="primary">
            Query editor
          </Text>
          <Text size="s" color="secondary">
            write search queries directly using Redis commands.
          </Text>
        </S.Section>

        <S.Section>
          <Text size="m" variant="semiBold" color="primary">
            Query library
          </Text>
          <Text size="s" color="secondary">
            reuse saved queries or use prebuilt examples for the sample data.
          </Text>
        </S.Section>

        <Row justify="end">
          <Button
            size="small"
            onClick={handleDismiss}
            data-testid="query-library-onboarding-dismiss"
          >
            Got it
          </Button>
        </Row>
      </S.Content>
    </RiPopover>
  )
}
